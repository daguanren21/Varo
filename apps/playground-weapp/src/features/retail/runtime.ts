import type { RetailService } from './service'
import { retailConfig } from './config'
import { createMockRetailService } from './mock-service'

export const retailService: RetailService = createMockRetailService({ scenario: retailConfig.scenario })
