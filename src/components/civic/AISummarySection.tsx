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
    new Set(['plain', 'who', 'what', 'why']) // Expand key sections by default
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div id="summary" className={cn('space-y-4', className)}>
      {/* AI Disclaimer */}
      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">AI-Generated Summary</p>
          <p className="mt-1 text-blue-800">{AI_SUMMARY_DISCLAIMER}</p>
        </div>
      </div>

      {/* Plain Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-3 text-lg font-bold text-slate-900">Summary</h3>
        <div className="prose prose-sm max-w-none text-slate-700">
          {summary.plainSummary.split('\n\n').map((paragraph, i) => (
            <p key={i} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Expandable Sections */}
      <div className="space-y-2">
        {/* Who's Affected */}
        <AccordionSection
          title="Who's Affected"
          isExpanded={expandedSections.has('who')}
          onToggle={() => toggleSection('who')}
        >
          <p className="text-slate-700">{summary.whoAffected}</p>
        </AccordionSection>

        {/* What Changes */}
        <AccordionSection
          title="What Changes"
          isExpanded={expandedSections.has('what')}
          onToggle={() => toggleSection('what')}
        >
          <p className="text-slate-700">{summary.whatChanges}</p>
        </AccordionSection>

        {/* Why It Matters */}
        <AccordionSection
          title="Why It Matters"
          isExpanded={expandedSections.has('why')}
          onToggle={() => toggleSection('why')}
        >
          <p className="text-slate-700">{summary.whyItMatters}</p>
        </AccordionSection>

        {/* Arguments */}
        <AccordionSection
          title="Arguments For & Against"
          isExpanded={expandedSections.has('arguments')}
          onToggle={() => toggleSection('arguments')}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {/* Arguments For */}
            <div>
              <h4 className="mb-3 font-semibold text-green-700">Arguments For</h4>
              <ul className="space-y-2">
                {summary.argumentsFor.map((arg, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-green-600">•</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Arguments Against */}
            <div>
              <h4 className="mb-3 font-semibold text-red-700">Arguments Against</h4>
              <ul className="space-y-2">
                {summary.argumentsAgainst.map((arg, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-red-600">•</span>
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AccordionSection>

        {/* Important Dates */}
        {summary.importantDates.length > 0 && (
          <AccordionSection
            title="Important Dates"
            isExpanded={expandedSections.has('dates')}
            onToggle={() => toggleSection('dates')}
          >
            <div className="space-y-3">
              {summary.importantDates.map((date, i) => (
                <div key={i} className="flex gap-3">
                  <Calendar className="h-5 w-5 flex-shrink-0 text-orange-600" />
                  <div>
                    <p className="font-medium text-slate-900">{date.date}</p>
                    <p className="text-sm text-slate-600">{date.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* Next Actions */}
        <AccordionSection
          title="What You Can Do"
          isExpanded={expandedSections.has('actions')}
          onToggle={() => toggleSection('actions')}
        >
          <ul className="space-y-2">
            {summary.nextActions.map((action, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-orange-600" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>
      </div>

      {/* Categories and Jurisdictions */}
      <div className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Categories</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.categories.map((cat) => (
              <CategoryBadge key={cat} category={cat} size="sm" showIcon={false} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-500">
            Affected Jurisdictions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.affectedJurisdictions.map((jurisdiction) => (
              <span
                key={jurisdiction}
                className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
              >
                {jurisdiction}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Accordion section component
 */
interface AccordionSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function AccordionSection({ title, isExpanded, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-900 hover:bg-slate-50"
      >
        <span>{title}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-slate-500 transition-transform',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {isExpanded && <div className="border-t border-slate-200 p-4">{children}</div>}
    </div>
  )
}
