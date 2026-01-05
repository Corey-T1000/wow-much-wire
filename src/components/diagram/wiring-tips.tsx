"use client";

import { useState } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Cable,
  CircleSlash,
  Power,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function WiringTips() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700/50 rounded-t-lg transition-colors">
            <CardTitle className="text-sm text-neutral-900 dark:text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Wiring Reference
              </span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Accordion type="single" collapsible className="w-full">
              {/* Wire Sizing Guide - Combined */}
              <AccordionItem value="wire-sizing" className="border-neutral-200 dark:border-neutral-700">
                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Cable className="h-3 w-3 text-blue-500" />
                    Wire Sizing Guide
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-xs space-y-4">
                    {/* Ampacity Chart */}
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Ampacity (max continuous)</p>
                      <div className="grid grid-cols-4 gap-x-2 gap-y-0.5 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                        <div>20 AWG</div><div>5A</div>
                        <div>14 AWG</div><div>15A</div>
                        <div>18 AWG</div><div>7A</div>
                        <div>12 AWG</div><div>20A</div>
                        <div>16 AWG</div><div>10A</div>
                        <div>10 AWG</div><div>30A</div>
                      </div>
                      <p className="text-amber-600 dark:text-amber-400 mt-1 text-[10px]">
                        Derate 20% in engine bay
                      </p>
                    </div>

                    {/* Voltage Drop */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Voltage Drop</p>
                      <div className="text-neutral-600 dark:text-neutral-300 space-y-1 text-[11px]">
                        <p>• Target: &lt;3% drop (0.4V at 12V)</p>
                        <p>• Sensors: &lt;1% drop critical</p>
                        <p>• Long runs (&gt;10ft): go one gauge larger</p>
                      </div>
                    </div>

                    {/* Branching */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Branching Rule</p>
                      <p className="text-neutral-600 dark:text-neutral-300 text-[11px]">
                        Feed wire must carry sum of all branches
                      </p>
                      <div className="mt-1 pl-2 border-l-2 border-neutral-300 dark:border-neutral-600 text-[10px] text-neutral-500 dark:text-neutral-400">
                        Example: 2A + 0.5A + 1A = 3.5A → use 16 AWG min
                      </div>
                    </div>

                    {/* Sensor ground warning */}
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-800">
                      <p className="text-amber-700 dark:text-amber-400 text-[10px]">
                        <strong>Sensor grounds:</strong> Never splice to power grounds. Run to MS3 Pin 3 (SGND).
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Grounding Best Practices */}
              <AccordionItem value="grounding" className="border-neutral-200 dark:border-neutral-700">
                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <CircleSlash className="h-3 w-3 text-gray-500" />
                    Grounding Rules
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-xs space-y-2 text-neutral-600 dark:text-neutral-300">
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-600 dark:text-amber-400">Star Ground Topology</p>
                      <p className="text-[11px]">All major grounds meet at one point on engine block</p>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <p><strong>Star ground connects:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Battery negative (4 AWG)</li>
                        <li>PDM coil ground - BLUE-C</li>
                        <li>MS3 power ground - Pin 2</li>
                        <li>MS3 case ground</li>
                        <li>Alternator case</li>
                      </ul>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px]">
                      <p><strong>Separate ground points:</strong></p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Front chassis - headlights, fans, markers</li>
                        <li>Rear chassis - tail lights, fuel pump</li>
                        <li>Dash - gauges, radio, interior lights</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* PDM Power Sources */}
              <AccordionItem value="pdm-power" className="border-neutral-200 dark:border-neutral-700">
                <AccordionTrigger className="text-xs py-2 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Power className="h-3 w-3 text-red-500" />
                    PDM Power Sources
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-xs space-y-3 text-neutral-600 dark:text-neutral-300">
                    <div>
                      <p className="font-semibold text-green-600 dark:text-green-400 mb-1">Always-On (Battery Direct)</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        <li>Radio memory</li>
                        <li>ECU keep-alive</li>
                        <li>Clock/alarm</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400 mb-1">Ignition-Switched (ACC/RUN)</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        <li>Fuel pump (via relay)</li>
                        <li>ECU main power</li>
                        <li>Gauges & dash</li>
                        <li>Wipers, radio power</li>
                        <li>A/C, fans</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Start Position Only</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                        <li>Starter solenoid</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
