import type { Prisma, User } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.UserCreateArgs>({
  user: {
    one: { data: { email: 'String2861401' } },
    two: { data: { email: 'String4964294' } },
  },
})

export type StandardScenario = ScenarioData<User, 'user'>
