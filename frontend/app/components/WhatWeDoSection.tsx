
import { Box, Typography, Container, Grid, Card, CardContent } from "@mui/material";
import {
  Memory as ComputeIcon,
  AccountBalance as SavingsIcon,
  VolunteerActivism as CharityIcon,
  SmartToy as AIIcon
} from "@mui/icons-material";

const services = [
  {
    icon: <ComputeIcon sx={{ fontSize: 48, color: "#1e3a8a" }} />,
    title: "DePIN Resource Sharing",
    description:
      "Contribute your idle device resources (compute power, storage, bandwidth) to our decentralized network and earn $HBAR tokens based on your contribution to AI training and inference tasks."
  },
  {
    icon: <SavingsIcon sx={{ fontSize: 48, color: "#1e3a8a" }} />,
    title: "Automated Savings Vault",
    description:
      "70% of your earnings are automatically deposited into a high-yield savings vault that earns interest through Hedera's DeFi protocols, building your wealth passively."
  },
  {
    icon: <CharityIcon sx={{ fontSize: 48, color: "#1e3a8a" }} />,
    title: "Transparent Charity Impact",
    description:
      "30% of network earnings are directed to a central charity vault supporting homeless children, road renovation, and community development projects with full on-chain transparency."
  },
  {
    icon: <AIIcon sx={{ fontSize: 48, color: "#1e3a8a" }} />,
    title: "AI-Powered Optimization",
    description:
      "Our AI agent dynamically matches resource supply with demand, optimizes task allocation, and maximizes returns for all network participants while ensuring network health."
  }
];

export default function WhatWeDoSection() {
  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        py: 12,
        position: "relative"
      }}
    >
      {/* Background gradient at bottom */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(176,136,240,0.1) 100%)",
          zIndex: 1
        }}
      />

      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 3 } }}
      >
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#000000",
              mb: 3,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" }
            }}
          >
            What we do
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#000000",
              fontSize: { xs: "1rem", md: "1.2rem" },
              maxWidth: "800px",
              mx: "auto",
              lineHeight: 1.6
            }}
          >
            AIDEN is a revolutionary DePIN platform that transforms idle device
            resources into passive income, automated savings, and charitable
            impact through AI-powered optimization and transparent blockchain
            technology.
          </Typography>
        </Box>

        {/* Services Grid */}
        <Grid container spacing={{ xs: 3, md: 4 }}>
          {services.map((service, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease-in-out"
                  }
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ mb: 3 }}>{service.icon}</Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: "#000000",
                      mb: 2,
                      fontSize: { xs: "1.2rem", md: "1.4rem" }
                    }}
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#000000",
                      lineHeight: 1.6,
                      fontSize: { xs: "0.9rem", md: "1rem" }
                    }}
                  >
                    {service.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Architecture Overview */}
        <Box sx={{ mt: { xs: 8, md: 12 }, textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: "#000000",
              mb: 4,
              fontSize: { xs: "1.8rem", md: "2.5rem" }
            }}
          >
            AIDEN Architecture
          </Typography>
          <Box
            sx={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              p: { xs: 4, md: 6 },
              border: "2px solid #e2e8f0"
            }}
          >
            <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1e3a8a" }}
                  >
                    DePIN Network
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Users contribute device resources
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1e3a8a" }}
                  >
                    AI Orchestration
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Smart task matching & optimization
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#1e3a8a" }}
                  >
                    Hedera Smart Contracts
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666666" }}>
                    Automated 70/30 split distribution
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
