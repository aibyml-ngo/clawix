'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Compass, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authFetch } from '@/lib/auth';

interface PackSummary {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tags: string[];
  skillCount: number;
  agentCount: number;
}

export default function ExplorePage() {
  const [packs, setPacks] = useState<PackSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authFetch<{ success: boolean; data: PackSummary[] }>('/api/v1/packs')
      .then((res) => setPacks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load industry packs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
            industry packs
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Pre-built skill and agent bundles for specific industries. Pick a pack to see what your
          agent can do out of the box.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {packs.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Compass className="mb-3 size-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No industry packs found.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {packs.map((pack) => (
            <Link key={pack.id} href={`/explore/${pack.id}`} className="group focus:outline-none">
              <Card className="h-full cursor-pointer border-border/60 transition-all duration-150 hover:border-border hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ backgroundColor: `${pack.color}18` }}
                    >
                      {pack.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold leading-tight">{pack.name}</h2>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {pack.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {pack.description}
                  </p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      <span className="font-medium text-foreground">{pack.skillCount}</span> skills
                    </span>
                    <span>
                      <span className="font-medium text-foreground">{pack.agentCount}</span> agents
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
