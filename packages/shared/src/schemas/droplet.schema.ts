import { z } from 'zod';

// Supported DO regions
export const DO_REGIONS = [
  'nyc1', 'nyc3', 'sfo3', 'sgp1', 'lon1', 'fra1', 'ams3', 'tor1', 'blr1', 'syd1',
] as const;

export const DO_REGION_LABELS: Record<(typeof DO_REGIONS)[number], string> = {
  nyc1: 'New York 1',
  nyc3: 'New York 3',
  sfo3: 'San Francisco 3',
  sgp1: 'Singapore 1',
  lon1: 'London 1',
  fra1: 'Frankfurt 1',
  ams3: 'Amsterdam 3',
  tor1: 'Toronto 1',
  blr1: 'Bangalore 1',
  syd1: 'Sydney 1',
};

// Droplet plan catalog — matches DigitalOcean Basic droplet pricing
export interface DropletPlan {
  slug: string;
  memoryGib: number;
  vcpus: number;
  ssdGib: number;
  transferTib: number; // stored as GiB in label but displayed nicely
  priceHourly: number;
  priceMonthly: number;
}

export const DO_DROPLET_PLANS: DropletPlan[] = [
  { slug: 's-1vcpu-1gb',  memoryGib: 1,  vcpus: 1, ssdGib: 25,  transferTib: 1000,  priceHourly: 0.01042, priceMonthly: 7   },
  { slug: 's-1vcpu-2gb',  memoryGib: 2,  vcpus: 1, ssdGib: 50,  transferTib: 2000,  priceHourly: 0.02083, priceMonthly: 14  },
  { slug: 's-2vcpu-2gb',  memoryGib: 2,  vcpus: 2, ssdGib: 60,  transferTib: 3000,  priceHourly: 0.03125, priceMonthly: 21  },
  { slug: 's-2vcpu-4gb',  memoryGib: 4,  vcpus: 2, ssdGib: 80,  transferTib: 4000,  priceHourly: 0.04167, priceMonthly: 28  },
  { slug: 's-2vcpu-8gb',  memoryGib: 8,  vcpus: 2, ssdGib: 100, transferTib: 5000,  priceHourly: 0.06250, priceMonthly: 42  },
  { slug: 's-4vcpu-8gb',  memoryGib: 8,  vcpus: 4, ssdGib: 160, transferTib: 5000,  priceHourly: 0.08333, priceMonthly: 56  },
  { slug: 's-4vcpu-16gb', memoryGib: 16, vcpus: 4, ssdGib: 200, transferTib: 8000,  priceHourly: 0.12500, priceMonthly: 84  },
  { slug: 's-8vcpu-16gb', memoryGib: 16, vcpus: 8, ssdGib: 320, transferTib: 6000,  priceHourly: 0.16667, priceMonthly: 112 },
  { slug: 's-8vcpu-32gb', memoryGib: 32, vcpus: 8, ssdGib: 400, transferTib: 10000, priceHourly: 0.25000, priceMonthly: 168 },
];

export const DO_PLAN_SLUGS = DO_DROPLET_PLANS.map((p) => p.slug) as [string, ...string[]];

// GPU sizes — requires prior approval on your DO account
export const DO_GPU_SIZES = ['gpu-h100x1-80gb', 'gpu-h100x8-640gb'] as const;

export const SERVICE_PACKAGES = [
  'Install Generic AI Assistant only',
  'Install + Field Setup',
  'Install + Field Setup + Skill Update',
  'Install + Field Setup + Skill Update + Enquiry',
] as const;

export const SERVICE_FIELDS = [
  'Accounting',
  'Building Services',
  'Church Services',
  'Financial Services',
  'Legal Services',
  'Marketing',
  'Media Design',
  'NGO Social Services',
] as const;

export type ServicePackage = (typeof SERVICE_PACKAGES)[number];
export type ServiceField = (typeof SERVICE_FIELDS)[number];

export const createDropletSchema = z.object({
  size: z.string().min(1, 'Select a plan'),
  region: z.enum(DO_REGIONS, { errorMap: () => ({ message: 'Select a region' }) }),
  sshPublicKey: z
    .string()
    .min(1, 'SSH public key is required')
    .refine(
      (k) => k.trimStart().startsWith('ssh-') || k.trimStart().startsWith('ecdsa-'),
      'Must be a valid SSH public key (starts with ssh-rsa, ssh-ed25519, etc.)',
    ),
  servicePackage: z.enum(SERVICE_PACKAGES).optional(),
  serviceField: z.enum(SERVICE_FIELDS).optional(),
  nameSuffix: z
    .string()
    .max(40)
    .regex(/^[a-z0-9-]*$/, 'Only lowercase letters, numbers, and hyphens')
    .optional(),
});

export type CreateDropletInput = z.infer<typeof createDropletSchema>;
export type DoRegion = (typeof DO_REGIONS)[number];
export type DoGpuSize = (typeof DO_GPU_SIZES)[number];
