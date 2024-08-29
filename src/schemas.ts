import { z } from 'zod';

export const scholarshipSchema = z.object({
  name: z.string().describe("Name of the scholarship"),
  provider: z.string().describe("Provider of the scholarship"),
  description: z.string().describe("Description of the scholarship"),
  scholarshipType: z.enum(['FULL_SCHOLARSHIP', 'PARTIAL_SCHOLARSHIP', 'FEE_WAIVER', 'TUITION', 'LIVING_EXPENSES', 'RESEARCH', 'TRAVEL', 'MIXED', 'APPLICATION_FEE_WAIVER']),
  fundingAmount: z.number().nullable().describe("How much money does the scholarship award? "),
  fundingCurrency: z.string().nullable().describe("Currency of the funding amount"),
  applicationUrl: z.string().describe("URL to apply for the scholarship"),
  eligibleCountries: z.array(z.string()).describe("Complete list of countries eligible for the scholarship"),
  nonEligibleCountries: z.array(z.string()).describe("Complete list of countries not eligible for the scholarship"),
  applicationDeadline: z.string()
    .describe("Deadline to apply for the scholarship")
    .transform((str) => new Date(str)),
  programStartDate: z.string()
    .optional()
    .describe("Start date of the program")
    .transform((str) => str ? new Date(str) : null),
  // programDuration: z.string().describe("Duration of the program"),
  applicationFee: z.string().describe("Any application fee for the scholarship mentioned"),
  eligibilityCriteria: z.array(
    z.object({
      type: z.enum(['workExperience', 'academicQualification', 'englishLanguage', 'gpa', 'additionalRequirements', 'other']),
      description: z.string().describe("Full explanation of what is expected in detail for the eligibility criteria")
    })
  ),
  degreeTypes: z.array(z.enum(['BSC', 'MSC', 'PHD', 'OTHER'])).describe("The degree types that are eligible for this scholarship"),
  applicationProcess: z.array(z.string()).describe("List of step by step process of how to apply for the scholarship, in details. if not avaliable provide any use full guide or resources to  help the canditate what to do if they interested in applying"),
  requiredDocuments: z.array(z.string()).describe("List of documents required for the scholarship application, in details with count if mentioned"),
  additionalInfo: z.object({
    websiteUrl: z.string().describe("Website URL of the scholarship"),
    contactInfo: z.string().optional().describe("Contact information for the scholarship"),
    waiverRequestPeriod: z.string().optional().describe("Period for requesting a waiver"),
    exclusions: z.string().optional().describe("Specific exclusions for the scholarship, such as nationalities not eligible for the scholarshipo or other things")
  }),
  fieldsOfStudy: z.array(z.object({
    field: z.array(z.string()).describe("Field of study eligible for the scholarship, be very detailed, return a list of all fields of study eligible for the scholarship, if no are mentioned return Not specified")
  })).optional(),
});