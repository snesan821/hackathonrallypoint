'use client'

import { useState } from 'react'
import { AI_SUMMARY_DISCLAIMER } from '@/constants/ai'
import { cn } from '@/lib/utils/cn'
import { ChevronDown, Info, Calendar, CheckCircle } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import type { Category } from '@prisma/client'

interface AISummaryData {
  plainSummary: string
  whoAffected: string
  whatChanges: string
  whyItMatters: string
  argumentsFor: string[]
  argumentsAgainst: string[]
  importantDates: Array<{ date: string; description: string }>
  nextActions: string[]
  categories: Category[]
  affectedJurisdictions: string[]
  generatedAt: Date
}

interface AISummarySectionProps {
  summary: AISummaryData
  className?: string
}

export function AISummarySection({ summary, className }: AISummarySectionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['plain', 'who', 'what', 'why'])
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) newExpanded.delete(section)
    else newExpanded.add(section)
    setExpandedSections(newExpanded)
  }

  return (
    <div id="summary" className={cn('space-y-4', className)}>
      {/* AI Disclaimer */}
      <div className="flex gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-primary" />
        <div className="text-sm text-on-surface-variant">
          <p className="font-medium text-on-surface">AI-Generated Summary</p>
          <p className="mt-1">{AI_SUMMARY_DISCLAIMER}</p>
        </div>
      </div>

      {/* Plain Summary */}
      <div className="rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-6">
        <h3 className="mb-3 text-lg font-bold text-on-surface font-headline">Summary</h3>
        <div className="prose prose-sm max-w-none text-on-surface-variant">
          {summary.plainSummary.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        <AccordionSection title="Who's Affected" isExpanded={expandedSections.has('who')} onToggle={() => toggleSection('who')}>
          <p className="text-on-surface-variant">{summary.whoAffected}</p>
        </AccordionSection>

        <AccordionSection title="What Changes" isExpanded={expandedSections.has('what')} onToggle={() => toggleSection('what')}>
          <p className="text-on-surface-variant">{summary.whatChanges}</p>
        </AccordionSection>

        <AccordionSection title="Why It Matters" isExpanded={expandedSections.has('why')} onToggle={() => toggleSection('why')}>
          <p className="text-on-surface-variant">{summary.whyItMatters}</p>
        </AccordionSection>

        <AccordionSection title="Arguments For & Against" isExpanded={expandedSections.has('arguments')} onToggle={() => toggleSection('arguments')}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-[var(--co-success)]">Arguments For</h4>
              <ul className="space-y-2">
                {summary.argumentsFor.map((arg, i) => (
                  <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                    <span className="text-[var(--co-success)]">•</span><span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-[var(--co-error)]">Arguments Against</h4>
              <ul className="space-y-2">
                {summary.argumentsAgainst.map((arg, i) => (
                  <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                    <span className="text-[var(--co-error)]">•</span><span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionSection>

        {summary.importantDates.length > 0 && (
          <AccordionSection title="Important Dates" isExpanded={expandedSections.has('dates')} onToggle={() => toggleSection('dates')}>
            <div className="space-y-3">
              {summary.importantDates.map((date, i) => (
                <div key={i} className="flex gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-on-surface">{date.date}</p>
                    <p className="text-sm text-on-surface-variant">{date.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        <AccordionSection title="What You Can Do" isExpanded={expandedSections.has('actions')} onToggle={() => toggleSection('actions')}>
          <ul className="space-y-2">
            {summary.nextActions.map((action, i) => (
              <li key={i} className="flex gap-2 text-sm text-on-surface-variant">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>
      </div>

      {/* Categories and Jurisdictions */}
      <div className="flex flex-wrap gap-4 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-on-surface-variant">Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} size="sm" showIcon={false} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-on-surface-variant">Affected Jurisdictions</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.affectedJurisdictions.map((jurisdiction) => (
              <span key={jurisdiction} className="rounded bg-surface-container-highest px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                {jurisdiction}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AccordionSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ title, isExpanded, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-lowest">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-on-surface hover:bg-surface-container-low"
      >
        <span>{title}</span>
        <ChevronDown className={cn('h-5 w-5 text-on-surface-variant transition-transform', isExpanded && 'rotate-180')} />
      </button>
      {isExpanded && <div className="border-t border-outline-variant/15 p-4">{children}</div>}
    </div>
  )
}
