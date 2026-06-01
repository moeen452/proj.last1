-- AlterTable
ALTER TABLE "funding_rounds" ADD COLUMN "availableEquityPercentage" REAL;
ALTER TABLE "funding_rounds" ADD COLUMN "currentValuation" REAL;

-- AlterTable
ALTER TABLE "startups" ADD COLUMN "customerSatisfaction" INTEGER;
ALTER TABLE "startups" ADD COLUMN "requiredInvestment" REAL;
ALTER TABLE "startups" ADD COLUMN "servicesCount" INTEGER;
ALTER TABLE "startups" ADD COLUMN "totalClients" INTEGER;
