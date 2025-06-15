// Mock pour astro:content utilisé dans les tests
export const defineCollection = (config: { type: string; schema: unknown }) => config;

type RefineConfig = { message: string };
type ValidationFunction = (value: string) => boolean;

export const z = {
  object: (schema: Record<string, unknown>) => ({ schema }),
  string: () => ({ 
    uuid: () => ({ 
      refine: (fn: ValidationFunction, options: RefineConfig) => ({ fn, options }) 
    }),
    regex: (regex: RegExp, options: RefineConfig) => ({ regex, options }),
    optional: () => ({ optional: true })
  }),
  date: () => ({ type: 'date' }),
  enum: (values: string[]) => ({ enum: values })
}; 