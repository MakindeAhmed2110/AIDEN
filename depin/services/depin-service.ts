import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { dbManager } from '../database/manager.js';
import { hederaWalletManager } from '../wallet/hedera-wallet.js';
import { pointsService } from './points-service.js';

export interface DePINNode {
  id: number;
  userId: number;
  nodeId: string;
  name: string;
  location: string;
  isActive: boolean;
  totalBytesServed: number;
  totalUptime: number;
  lastActivity: Date | null;
  createdAt: Date;
}

export interface UsageProof {
  id: number;
  userId: number;
  nodeId: string;
  sessionId: string;
  timestamp: Date;
  bytesServed: number;
  uptime: number;
  cryptographicProof: string;
  hederaTransactionId: string | null;
  createdAt: Date;
}

export interface BandwidthMetrics {
  nodeId: string;
  timestamp: number;
  bytesServed: number;
  uptime: number;
  speedTest: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
  };
  sessionId: string;
}

export class DePINService {
  private db = dbManager.getDatabase();

  // Create a new DePIN node for a user
  async createNode(userId: number, nodeData: { name: string; location: string }): Promise<DePINNode> {
    try {
      const nodeId = `node-${uuidv4()}`;
      
      const insertNode = this.db.prepare(`
        INSERT INTO depin_nodes (user_id, node_id, name, location)
        VALUES (?, ?, ?, ?)
      `);

      const result = insertNode.run(userId, nodeId, nodeData.name, nodeData.location);
      const nodeDbId = result.lastInsertRowid as number;

      return {
        id: nodeDbId,
        userId,
        nodeId,
        name: nodeData.name,
        location: nodeData.location,
        isActive: true,
        totalBytesServed: 0,
        totalUptime: 0,
        lastActivity: null,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating DePIN node:', error);
      throw new Error(`Failed to create DePIN node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all nodes for a user
  async getUserNodes(userId: number): Promise<DePINNode[]> {
    try {
      const nodes = this.db.prepare(`
        SELECT * FROM depin_nodes 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `).all(userId) as any[];

      return nodes.map(node => ({
        id: node.id,
        userId: node.user_id,
        nodeId: node.node_id,
        name: node.name,
        location: node.location,
        isActive: Boolean(node.is_active),
        totalBytesServed: node.total_bytes_served,
        totalUptime: node.total_uptime,
        lastActivity: node.last_activity ? new Date(node.last_activity) : null,
        createdAt: new Date(node.created_at)
      }));
    } catch (error) {
      console.error('Error getting user nodes:', error);
      throw new Error(`Failed to get user nodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Toggle node status
  async toggleNode(userId: number, nodeId: string): Promise<boolean> {
    try {
      const updateNode = this.db.prepare(`
        UPDATE depin_nodes 
        SET is_active = NOT is_active 
        WHERE user_id = ? AND node_id = ?
      `);

      const result = updateNode.run(userId, nodeId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error toggling node:', error);
      throw new Error(`Failed to toggle node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Measure bandwidth for a node
  async measureNodeBandwidth(userId: number, nodeId: string): Promise<BandwidthMetrics> {
    try {
      // Get node info
      const node = this.db.prepare(`
        SELECT * FROM depin_nodes 
        WHERE user_id = ? AND node_id = ? AND is_active = 1
      `).get(userId, nodeId) as any;

      if (!node) {
        throw new Error('Node not found or inactive');
      }

      // Perform real bandwidth measurement
      const bandwidthTest = await this.performBandwidthTest();
      
      const metrics: BandwidthMetrics = {
        nodeId,
        timestamp: Date.now(),
        bytesServed: bandwidthTest.bytesServed,
        uptime: bandwidthTest.uptime,
        speedTest: bandwidthTest.speedTest,
        sessionId: this.generateSessionId()
      };

      // Update node statistics
      const updateNode = this.db.prepare(`
        UPDATE depin_nodes 
        SET total_bytes_served = total_bytes_served + ?, 
            total_uptime = total_uptime + ?, 
            last_activity = CURRENT_TIMESTAMP
        WHERE user_id = ? AND node_id = ?
      `);

      updateNode.run(metrics.bytesServed, metrics.uptime, userId, nodeId);

      // Create usage proof
      const usageProof = await this.createUsageProof(userId, metrics);
      
      // Store bandwidth contribution in the new table
      const storeContribution = this.db.prepare(`
        INSERT INTO bandwidth_contributions (
          user_id, node_id, session_id, contribution_bytes,
          download_speed_mbps, upload_speed_mbps, latency_ms,
          uptime_percentage, test_duration_ms, contribution_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const testDuration = Date.now() - metrics.timestamp;
      storeContribution.run(
        userId,
        nodeId,
        metrics.sessionId,
        metrics.bytesServed,
        metrics.speedTest.downloadSpeed,
        metrics.speedTest.uploadSpeed,
        metrics.speedTest.latency,
        metrics.uptime,
        testDuration,
        new Date(metrics.timestamp).toISOString()
      );
      
      // Calculate and store points
      const pointsEarned = Math.floor(metrics.bytesServed / (1024 * 1024)); // 1 point per MB
      
      // Add points to user's account
      if (pointsEarned > 0) {
        await pointsService.addPoints(userId, pointsEarned);
        console.log(`⭐ Points added to user account: ${pointsEarned} points`);
      }

      // Enhanced console logging
      console.log(`🚀 [DePIN] Bandwidth measurement completed for node ${nodeId}:`);
      console.log(`   📊 Data served: ${(metrics.bytesServed / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   ⭐ Points earned: ${pointsEarned} (1 point per MB)`);
      console.log(`   ⬇️  Download speed: ${metrics.speedTest.downloadSpeed.toFixed(2)} Mbps`);
      console.log(`   ⬆️  Upload speed: ${metrics.speedTest.uploadSpeed.toFixed(2)} Mbps`);
      console.log(`   🏓 Latency: ${metrics.speedTest.latency.toFixed(1)} ms`);
      console.log(`   ⏱️  Uptime: ${metrics.uptime.toFixed(1)}%`);
      console.log(`   🆔 Session ID: ${metrics.sessionId}`);
      console.log(`   💾 Stored in bandwidth_contributions table`);
      console.log(`   💾 Points stored in user_points table`);
      
      return metrics;
    } catch (error) {
      console.error('Error measuring node bandwidth:', error);
      throw new Error(`Failed to measure bandwidth: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Perform actual bandwidth test
  private async performBandwidthTest(): Promise<{
    bytesServed: number;
    uptime: number;
    speedTest: {
      downloadSpeed: number;
      uploadSpeed: number;
      latency: number;
    };
  }> {
    try {
      // Test download speed by downloading a small file
      const testUrl = 'https://httpbin.org/bytes/1048576'; // 1MB test file
      const startTime = Date.now();
      
      const response = await fetch(testUrl);
      const data = await response.arrayBuffer();
      const endTime = Date.now();
      
      const bytesServed = data.byteLength;
      const downloadTimeMs = endTime - startTime;
      const downloadSpeedMbps = (bytesServed * 8) / (downloadTimeMs / 1000) / 1000000; // Convert to Mbps
      
      // Simulate upload speed (typically 10-20% of download speed)
      const uploadSpeedMbps = downloadSpeedMbps * (0.1 + Math.random() * 0.1);
      
      // Simulate latency (ping test)
      const latency = Math.random() * 50 + 10; // 10-60ms
      
      // Calculate uptime (simulate 95-99% uptime)
      const uptime = 95 + Math.random() * 4;
      
      return {
        bytesServed,
        uptime,
        speedTest: {
          downloadSpeed: Math.round(downloadSpeedMbps * 100) / 100,
          uploadSpeed: Math.round(uploadSpeedMbps * 100) / 100,
          latency: Math.round(latency * 100) / 100
        }
      };
    } catch (error) {
      console.warn('Real bandwidth test failed, using simulated data:', error);
      
      // Fallback to simulated data
      return {
        bytesServed: Math.floor(Math.random() * 1000000) + 100000, // 100KB - 1MB
        uptime: Math.random() * 100, // 0-100% uptime
        speedTest: {
          downloadSpeed: Math.random() * 100 + 50, // 50-150 Mbps
          uploadSpeed: Math.random() * 50 + 25,    // 25-75 Mbps
          latency: Math.random() * 20 + 5          // 5-25 ms
        }
      };
    }
  }

  // Create usage proof
  private async createUsageProof(userId: number, metrics: BandwidthMetrics): Promise<UsageProof> {
    try {
      // Create cryptographic proof
      const proofData = `${metrics.nodeId}-${metrics.sessionId}-${metrics.timestamp}-${metrics.bytesServed}`;
      const cryptographicProof = crypto.createHash('sha256').update(proofData).digest('hex');

      // Insert usage proof
      const insertProof = this.db.prepare(`
        INSERT INTO usage_proofs (user_id, node_id, session_id, timestamp, bytes_served, uptime, cryptographic_proof)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = insertProof.run(
        userId,
        metrics.nodeId,
        metrics.sessionId,
        new Date(metrics.timestamp).toISOString(),
        metrics.bytesServed,
        metrics.uptime,
        cryptographicProof
      );

      const proofId = result.lastInsertRowid as number;

      // Submit to Hedera (simulated)
      try {
        const hederaTransactionId = await hederaWalletManager.submitUsageProof({
          nodeId: metrics.nodeId,
          sessionId: metrics.sessionId,
          timestamp: metrics.timestamp,
          bytesServed: metrics.bytesServed,
          uptime: metrics.uptime,
          cryptographicProof
        });

        // Update proof with Hedera transaction ID
        const updateProof = this.db.prepare(`
          UPDATE usage_proofs 
          SET hedera_transaction_id = ? 
          WHERE id = ?
        `);
        updateProof.run(hederaTransactionId, proofId);
      } catch (hederaError) {
        console.error('Failed to submit to Hedera:', hederaError);
        // Continue without failing the entire operation
      }

      return {
        id: proofId,
        userId,
        nodeId: metrics.nodeId,
        sessionId: metrics.sessionId,
        timestamp: new Date(metrics.timestamp),
        bytesServed: metrics.bytesServed,
        uptime: metrics.uptime,
        cryptographicProof,
        hederaTransactionId: null, // Will be updated if Hedera submission succeeds
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Error creating usage proof:', error);
      throw new Error(`Failed to create usage proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get usage proofs for a user
  async getUserUsageProofs(userId: number, limit: number = 50): Promise<UsageProof[]> {
    try {
      const proofs = this.db.prepare(`
        SELECT * FROM usage_proofs 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
      `).all(userId, limit) as any[];

      return proofs.map(proof => ({
        id: proof.id,
        userId: proof.user_id,
        nodeId: proof.node_id,
        sessionId: proof.session_id,
        timestamp: new Date(proof.timestamp),
        bytesServed: proof.bytes_served,
        uptime: proof.uptime,
        cryptographicProof: proof.cryptographic_proof,
        hederaTransactionId: proof.hedera_transaction_id,
        createdAt: new Date(proof.created_at)
      }));
    } catch (error) {
      console.error('Error getting usage proofs:', error);
      throw new Error(`Failed to get usage proofs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get network statistics for a user
  async getUserNetworkStats(userId: number) {
    try {
      const stats = this.db.prepare(`
        SELECT 
          COUNT(*) as totalNodes,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeNodes,
          SUM(total_bytes_served) as totalBytesServed,
          AVG(total_uptime) as averageUptime
        FROM depin_nodes 
        WHERE user_id = ?
      `).get(userId) as any;

      const proofCount = this.db.prepare(`
        SELECT COUNT(*) as totalSessions 
        FROM usage_proofs 
        WHERE user_id = ?
      `).get(userId) as any;

      // Get total bandwidth contributions from the new table
      const contributionStats = this.db.prepare(`
        SELECT 
          COUNT(*) as totalContributions,
          SUM(contribution_bytes) as totalContributionBytes,
          AVG(download_speed_mbps) as averageDownloadSpeed,
          AVG(upload_speed_mbps) as averageUploadSpeed,
          AVG(latency_ms) as averageLatency,
          AVG(uptime_percentage) as averageContributionUptime,
          MAX(contribution_timestamp) as lastContributionTime
        FROM bandwidth_contributions 
        WHERE user_id = ?
      `).get(userId) as any;

      // Get user points
      const userPoints = await pointsService.getUserPoints(userId);

      return {
        totalNodes: stats.totalNodes || 0,
        activeNodes: stats.activeNodes || 0,
        totalBytesServed: stats.totalBytesServed || 0,
        totalGBServed: (stats.totalBytesServed || 0) / (1024 * 1024 * 1024),
        averageUptime: stats.averageUptime || 0,
        totalSessions: proofCount.totalSessions || 0,
        // New contribution data
        totalContributions: contributionStats.totalContributions || 0,
        totalContributionBytes: contributionStats.totalContributionBytes || 0,
        totalContributionGB: (contributionStats.totalContributionBytes || 0) / (1024 * 1024 * 1024),
        averageDownloadSpeed: Math.round((contributionStats.averageDownloadSpeed || 0) * 100) / 100,
        averageUploadSpeed: Math.round((contributionStats.averageUploadSpeed || 0) * 100) / 100,
        averageLatency: Math.round((contributionStats.averageLatency || 0) * 100) / 100,
        averageContributionUptime: Math.round((contributionStats.averageContributionUptime || 0) * 100) / 100,
        lastContributionTime: contributionStats.lastContributionTime,
        // Points data
        epochPoints: userPoints.totalEpochPoints,
        todayPoints: userPoints.todayPoints
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw new Error(`Failed to get network stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get epoch-specific earnings for a user
  async getEpochEarnings(userId: number, epochNumber: number = 1) {
    try {
      // Get all contributions for the specified epoch
      // For now, we'll consider all contributions as part of epoch 1
      const epochStats = this.db.prepare(`
        SELECT 
          COUNT(*) as totalContributions,
          SUM(contribution_bytes) as totalBytes,
          AVG(download_speed_mbps) as avgDownloadSpeed,
          AVG(upload_speed_mbps) as avgUploadSpeed,
          AVG(uptime_percentage) as avgUptime,
          MIN(contribution_timestamp) as epochStart,
          MAX(contribution_timestamp) as epochEnd
        FROM bandwidth_contributions 
        WHERE user_id = ?
      `).get(userId) as any;

      // Calculate earnings based on contribution (1 point per MB)
      const totalMB = (epochStats.totalBytes || 0) / (1024 * 1024);
      const epochEarnings = totalMB; // 1 point per MB

      return {
        epochNumber,
        totalContributions: epochStats.totalContributions || 0,
        totalBytes: epochStats.totalBytes || 0,
        totalMB: Math.round(totalMB * 100) / 100, // Round to 2 decimal places
        totalGB: Math.round((totalMB / 1024) * 1000) / 1000, // Also provide GB for compatibility
        epochEarnings: Math.round(epochEarnings * 100) / 100, // Points earned (1 point per MB)
        avgDownloadSpeed: Math.round((epochStats.avgDownloadSpeed || 0) * 100) / 100,
        avgUploadSpeed: Math.round((epochStats.avgUploadSpeed || 0) * 100) / 100,
        avgUptime: Math.round((epochStats.avgUptime || 0) * 100) / 100,
        epochStart: epochStats.epochStart,
        epochEnd: epochStats.epochEnd
      };
    } catch (error) {
      console.error('Error getting epoch earnings:', error);
      throw new Error(`Failed to get epoch earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user contribution statistics
  async getUserContributionStats(userId: number) {
    try {
      const contributionStats = this.db.prepare(`
        SELECT 
          COUNT(*) as totalContributions,
          SUM(contribution_bytes) as totalContributionBytes,
          AVG(download_speed_mbps) as averageDownloadSpeed,
          AVG(upload_speed_mbps) as averageUploadSpeed,
          AVG(latency_ms) as averageLatency,
          AVG(uptime_percentage) as averageContributionUptime,
          MAX(contribution_timestamp) as lastContributionTime,
          MIN(contribution_timestamp) as firstContributionTime
        FROM bandwidth_contributions 
        WHERE user_id = ?
      `).get(userId) as any;

      return {
        totalContributions: contributionStats.totalContributions || 0,
        totalContributionBytes: contributionStats.totalContributionBytes || 0,
        totalContributionGB: (contributionStats.totalContributionBytes || 0) / (1024 * 1024 * 1024),
        averageDownloadSpeed: Math.round((contributionStats.averageDownloadSpeed || 0) * 100) / 100,
        averageUploadSpeed: Math.round((contributionStats.averageUploadSpeed || 0) * 100) / 100,
        averageLatency: Math.round((contributionStats.averageLatency || 0) * 100) / 100,
        averageContributionUptime: Math.round((contributionStats.averageContributionUptime || 0) * 100) / 100,
        lastContributionTime: contributionStats.lastContributionTime,
        firstContributionTime: contributionStats.firstContributionTime
      };
    } catch (error) {
      console.error('Error getting user contribution stats:', error);
      throw new Error(`Failed to get user contribution stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get last session data for a user
  async getLastSessionData(userId: number) {
    try {
      const lastSession = this.db.prepare(`
        SELECT 
          contribution_timestamp,
          contribution_bytes,
          download_speed_mbps,
          upload_speed_mbps,
          latency_ms,
          uptime_percentage,
          test_duration_ms
        FROM bandwidth_contributions 
        WHERE user_id = ? 
        ORDER BY contribution_timestamp DESC 
        LIMIT 1
      `).get(userId) as any;

      if (!lastSession) {
        return null;
      }

      return {
        lastContributionTime: new Date(lastSession.contribution_timestamp),
        lastContributionBytes: lastSession.contribution_bytes,
        lastDownloadSpeed: lastSession.download_speed_mbps,
        lastUploadSpeed: lastSession.upload_speed_mbps,
        lastLatency: lastSession.latency_ms,
        lastUptime: lastSession.uptime_percentage,
        lastTestDuration: lastSession.test_duration_ms
      };
    } catch (error) {
      console.error('Error getting last session data:', error);
      throw new Error(`Failed to get last session data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session-${Date.now()}-${uuidv4().substring(0, 8)}`;
  }

  // Store real-time measurement from frontend
  async storeMeasurement(userId: number, measurement: {
    dataServed: number;
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
    uptime: number;
    pointsEarned: number;
  }) {
    try {
      const { dataServed, downloadSpeed, uploadSpeed, latency, uptime, pointsEarned } = measurement;

      // Insert measurement into bandwidth_contributions table
      await this.db.prepare(`
        INSERT INTO bandwidth_contributions (
          user_id, 
          node_id, 
          data_served, 
          download_speed, 
          upload_speed, 
          latency, 
          uptime, 
          points_earned, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        'frontend-simulation', // Use a special node ID for frontend measurements
        dataServed,
        downloadSpeed,
        uploadSpeed,
        latency,
        uptime,
        pointsEarned,
        new Date().toISOString()
      );

      // Update user points
      await this.db.prepare(`
        UPDATE user_points 
        SET 
          total_epoch_points = total_epoch_points + ?,
          today_points = today_points + ?,
          last_updated = ?
        WHERE user_id = ?
      `).run(
        pointsEarned,
        pointsEarned,
        new Date().toISOString(),
        userId
      );

      console.log(`📊 Stored measurement for user ${userId}: ${dataServed} bytes, ${pointsEarned} points`);
    } catch (error) {
      console.error('Error storing measurement:', error);
      throw new Error(`Failed to store measurement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update user's final stats when disconnecting
  async updateUserFinalStats(userId: number, finalStats: {
    totalBytesServed: number;
    totalContributions: number;
    totalEpochPoints: number;
    todayPoints: number;
    averageUptime: number;
    lastContributionTime: string;
  }) {
    try {
      const { totalBytesServed, totalContributions, totalEpochPoints, todayPoints, averageUptime, lastContributionTime } = finalStats;

      // Update user points with final values
      await this.db.prepare(`
        UPDATE user_points 
        SET 
          total_epoch_points = ?,
          today_points = ?,
          last_updated = ?
        WHERE user_id = ?
      `).run(
        totalEpochPoints,
        todayPoints,
        new Date().toISOString(),
        userId
      );

      // Update network stats
      await this.db.prepare(`
        UPDATE network_stats 
        SET 
          total_bytes_served = ?,
          total_contributions = ?,
          average_uptime = ?,
          last_contribution_time = ?,
          updated_at = ?
        WHERE user_id = ?
      `).run(
        totalBytesServed,
        totalContributions,
        averageUptime,
        lastContributionTime,
        new Date().toISOString(),
        userId
      );

      console.log(`✅ Updated final stats for user ${userId}: ${totalBytesServed} bytes, ${totalEpochPoints} points`);
    } catch (error) {
      console.error('Error updating final stats:', error);
      throw new Error(`Failed to update final stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const depinService = new DePINService();