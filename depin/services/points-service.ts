import { dbManager } from '../database/manager.js';

export interface UserPoints {
  id: number;
  userId: number;
  totalEpochPoints: number;
  todayPoints: number;
  lastUpdated: Date;
  createdAt: Date;
}

export class PointsService {
  private db = dbManager.getDatabase();

  // Get or create user points record
  async getUserPoints(userId: number): Promise<UserPoints> {
    try {
      let points = this.db.prepare(`
        SELECT * FROM user_points 
        WHERE user_id = ?
      `).get(userId) as any;

      if (!points) {
        // Create new points record for user
        const insertPoints = this.db.prepare(`
          INSERT INTO user_points (user_id, total_epoch_points, today_points)
          VALUES (?, 0, 0)
        `);
        insertPoints.run(userId);
        
        // Get the newly created record
        points = this.db.prepare(`
          SELECT * FROM user_points 
          WHERE user_id = ?
        `).get(userId) as any;
      }

      return {
        id: points.id,
        userId: points.user_id,
        totalEpochPoints: points.total_epoch_points,
        todayPoints: points.today_points,
        lastUpdated: new Date(points.last_updated),
        createdAt: new Date(points.created_at)
      };
    } catch (error) {
      console.error('Error getting user points:', error);
      throw new Error(`Failed to get user points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add points to user (both today and total epoch)
  async addPoints(userId: number, pointsToAdd: number): Promise<UserPoints> {
    try {
      // Get current points
      const currentPoints = await this.getUserPoints(userId);
      
      // Calculate new totals
      const newTodayPoints = currentPoints.todayPoints + pointsToAdd;
      const newTotalEpochPoints = currentPoints.totalEpochPoints + pointsToAdd;

      // Update points in database
      const updatePoints = this.db.prepare(`
        UPDATE user_points 
        SET total_epoch_points = ?, 
            today_points = ?, 
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      
      updatePoints.run(newTotalEpochPoints, newTodayPoints, userId);

      // Return updated points
      return await this.getUserPoints(userId);
    } catch (error) {
      console.error('Error adding points:', error);
      throw new Error(`Failed to add points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Reset today's points (for daily reset)
  async resetTodayPoints(userId: number): Promise<UserPoints> {
    try {
      const updatePoints = this.db.prepare(`
        UPDATE user_points 
        SET today_points = 0, 
            last_updated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `);
      
      updatePoints.run(userId);

      return await this.getUserPoints(userId);
    } catch (error) {
      console.error('Error resetting today points:', error);
      throw new Error(`Failed to reset today points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get points by user email
  async getUserPointsByEmail(email: string): Promise<UserPoints | null> {
    try {
      // First get user by email
      const user = this.db.prepare(`
        SELECT id FROM users WHERE email = ?
      `).get(email) as any;

      if (!user) {
        return null;
      }

      return await this.getUserPoints(user.id);
    } catch (error) {
      console.error('Error getting user points by email:', error);
      throw new Error(`Failed to get user points by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get all users points (for admin purposes)
  async getAllUsersPoints(): Promise<UserPoints[]> {
    try {
      const points = this.db.prepare(`
        SELECT up.*, u.email 
        FROM user_points up
        JOIN users u ON up.user_id = u.id
        ORDER BY up.total_epoch_points DESC
      `).all() as any[];

      return points.map(point => ({
        id: point.id,
        userId: point.user_id,
        totalEpochPoints: point.total_epoch_points,
        todayPoints: point.today_points,
        lastUpdated: new Date(point.last_updated),
        createdAt: new Date(point.created_at)
      }));
    } catch (error) {
      console.error('Error getting all users points:', error);
      throw new Error(`Failed to get all users points: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const pointsService = new PointsService();


