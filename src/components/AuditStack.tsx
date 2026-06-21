"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppState } from "@/app/providers";
import { TransitMode, DietType, EnergySource, AuditAnswers } from "@/utils/carbonCalc";
import { Car, Bike, Leaf, Zap, Home, Users, ArrowRight, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AuditStack() {
  const { submitAudit, loadingMissions, error } = useAppState();
  const shouldReduceMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [transitMode, setTransitMode] = useState<TransitMode>("gasoline-car");
  const [transitDistance, setTransitDistance] = useState<number>(50);
  const [dietType, setDietType] = useState<DietType>("balanced");
  const [energySource, setEnergySource] = useState<EnergySource>("grid-gas");
  const [weeklyKwh, setWeeklyKwh] = useState<number>(80);
  const [householdSize, setHouseholdSize] = useState<number>(2);

  // Validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Focus ref for screen readers on card change
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.focus();
    }
  }, [currentStep]);

  // Handle step transitions
  const nextStep = () => {
    setValidationError(null);
    if (currentStep === 0) {
      if (transitDistance < 0 || isNaN(transitDistance)) {
        setValidationError("Distance cannot be negative.");
        return;
      }
    } else if (currentStep === 2) {
      if (weeklyKwh < 0 || isNaN(weeklyKwh)) {
        setValidationError("Weekly energy usage cannot be negative.");
        return;
      }
      if (householdSize < 1 || isNaN(householdSize)) {
        setValidationError("Household size must be at least 1.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setValidationError(null);
    const answers: AuditAnswers = {
      transitMode,
      transitDistance: Number(transitDistance),
      dietType,
      energySource,
      weeklyKwh: Number(weeklyKwh),
      householdSize: Number(householdSize),
    };
    await submitAudit(answers);
  };

  // Motion variants that check for prefers-reduced-motion
  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 300 : -300,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction < 0 ? 300 : -300,
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Custom step navigation indicator dots
  const steps = [
    { label: "Transit", icon: Car },
    { label: "Diet", icon: Leaf },
    { label: "Energy", icon: Zap },
    { label: "Confirm", icon: Home },
  ];

  return (
    <section 
      className="w-full max-w-xl mx-auto px-4 py-8"
      aria-label="Carbon Footprint Audit Questionnaire"
    >
      {/* Interactive Step Timeline Indicator */}
      <nav 
        className="flex items-center justify-between mb-8"
        aria-label="Audit Progress Navigation"
      >
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <div key={idx} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => idx <= currentStep && setCurrentStep(idx)}
                disabled={idx > currentStep}
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all relative z-10 ${
                  isActive 
                    ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold scale-110 shadow-lg shadow-emerald-500/20"
                    : isCompleted
                      ? "bg-emerald-950/80 border-emerald-600 text-emerald-400 cursor-pointer"
                      : "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
                aria-label={`Go to Step ${idx + 1}: ${step.label}`}
                aria-current={isActive ? "step" : undefined}
              >
                <StepIcon className="w-5 h-5" />
              </button>
              {idx < steps.length - 1 && (
                <div 
                  className={`h-0.5 flex-grow mx-2 transition-colors duration-300 ${
                    idx < currentStep ? "bg-emerald-600" : "bg-slate-800"
                  }`} 
                  role="presentation"
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Main Questionnaire Card Stack Container */}
      <div 
        ref={cardRef}
        tabIndex={-1} 
        className="glass rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      >
        <AnimatePresence mode="wait" custom={currentStep}>
          {currentStep === 0 && (
            <motion.div
              key="step-transit"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <fieldset className="space-y-6">
                <legend className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2 font-heading">
                  <Car className="text-emerald-400 w-7 h-7" /> Phase 1: Transit Audit
                </legend>
                <p className="text-slate-400 text-sm leading-relaxed">
                  How do you commute most often in a typical week, and what is your average distance covered?
                </p>

                {/* Transit Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "gasoline-car", label: "Solo Gasoline Car", desc: "Standard gas or diesel vehicle", icon: Car },
                    { id: "electric-car", label: "Solo Electric Car", desc: "Fully electric or plug-in hybrid", icon: Zap },
                    { id: "public-transit", label: "Public Transit", desc: "Bus, train, metro, or tram", icon: Users },
                    { id: "active", label: "Active Commuting", desc: "Walking, cycling, or none", icon: Bike },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTransitMode(option.id as TransitMode)}
                      className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        transitMode === option.id 
                          ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5" 
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                      aria-label={`Select transit mode: ${option.label}`}
                    >
                      <div className={`p-2 rounded-lg ${transitMode === option.id ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{option.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{option.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Distance Input */}
                {transitMode !== "active" && (
                  <div className="space-y-2 pt-2">
                    <label 
                      htmlFor="transit-distance-input" 
                      className="block text-sm font-semibold text-slate-300"
                    >
                      Estimated Weekly Commute Distance (km)
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <input
                        type="number"
                        id="transit-distance-input"
                        value={transitDistance}
                        onChange={(e) => setTransitDistance(Math.max(0, parseInt(e.target.value) || 0))}
                        min="0"
                        max="2000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        aria-label="Enter commute distance in kilometers"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 text-sm font-medium">
                        km/week
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step-diet"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <fieldset className="space-y-6">
                <legend className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2 font-heading">
                  <Leaf className="text-emerald-400 w-7 h-7" /> Phase 2: Diet Audit
                </legend>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Food production is responsible for a quarter of global emissions. Which category matches your diet?
                </p>

                {/* Diet Options */}
                <div className="space-y-3">
                  {[
                    { id: "meat-heavy", label: "Meat Lover", desc: "Frequent red meat (beef, pork) and dairy products", impact: "High carbon footprint (~55 kg CO2e/wk)" },
                    { id: "balanced", label: "Balanced Foodie", desc: "Occasional red meat, chicken, seafood, and dairy", impact: "Medium footprint (~30 kg CO2e/wk)" },
                    { id: "vegetarian", label: "Vegetarian", desc: "Dairy and eggs, but strictly no animal meat", impact: "Low footprint (~18 kg CO2e/wk)" },
                    { id: "vegan", label: "Plant-Powered Vegan", desc: "100% plant-based diet, no animal ingredients", impact: "Minimal footprint (~12 kg CO2e/wk)" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDietType(option.id as DietType)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        dietType === option.id 
                          ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5" 
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                      aria-label={`Select diet type: ${option.label}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${dietType === option.id ? "border-emerald-400" : "border-slate-600"}`}>
                          {dietType === option.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-sm">{option.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{option.desc}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded ${
                        option.id === "meat-heavy" 
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : option.id === "balanced" 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {option.id === "meat-heavy" ? "High" : option.id === "balanced" ? "Medium" : "Eco"}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-energy"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <fieldset className="space-y-6">
                <legend className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2 font-heading">
                  <Zap className="text-emerald-400 w-7 h-7" /> Phase 3: Household Energy
                </legend>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your home emissions depend on utility sources and residents. We divide shared bills by household members.
                </p>

                {/* Energy Source Selector */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-300">
                    Primary Home Energy Setup
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "grid-gas", label: "Grid Electricity + Gas Heating", desc: "Baseline natural gas heating & public grid power" },
                      { id: "clean-electricity", label: "100% Clean Energy + Heat Pump", desc: "Solar plan, wind offsets, zero-carbon electric pump" },
                      { id: "grid-oil-coal", label: "Grid Electricity + Oil/Coal Heating", desc: "High emission heating methods & public grid power" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setEnergySource(option.id as EnergySource)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                          energySource === option.id 
                            ? "bg-emerald-500/10 border-emerald-500" 
                            : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                        }`}
                        aria-label={`Select energy source: ${option.label}`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${energySource === option.id ? "border-emerald-400" : "border-slate-600"}`}>
                          {energySource === option.id && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 text-xs">{option.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{option.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Household Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label 
                      htmlFor="weekly-kwh-input" 
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Weekly Electricity (kWh)
                    </label>
                    <input
                      type="number"
                      id="weekly-kwh-input"
                      value={weeklyKwh}
                      onChange={(e) => setWeeklyKwh(Math.max(0, parseInt(e.target.value) || 0))}
                      min="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Weekly household electricity usage in kilowatt hours"
                    />
                    <span className="text-[10px] text-slate-500 block">Avg: ~75-100 kWh/wk</span>
                  </div>

                  <div className="space-y-2">
                    <label 
                      htmlFor="household-size-input" 
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Household Residents
                    </label>
                    <input
                      type="number"
                      id="household-size-input"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      aria-label="Number of members in your household"
                    />
                    <span className="text-[10px] text-slate-500 block">Used to share impact</span>
                  </div>
                </div>
              </fieldset>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-confirm"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-slate-100 font-heading">
                Ready to Initiate your EcoQuest?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Confirm your parameters below. Our AI engine will run these indicators through Google Vertex AI to build your customized mission checklist.
              </p>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-3 divide-y divide-slate-800/60 text-sm">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-slate-400">Weekly Commute:</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {transitMode.replace("-", " ")} ({transitDistance} km)
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Diet Setup:</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {dietType.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Heating Source:</span>
                  <span className="font-semibold text-slate-200 capitalize">
                    {energySource.replace("-", " ").replace("grid", "grid electricity")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Household Usage:</span>
                  <span className="font-semibold text-slate-200">
                    {weeklyKwh} kWh / {householdSize} Resident{householdSize > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {error && (
                <div 
                  className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-start gap-2 text-xs"
                  role="alert"
                >
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error compiling recommendations:</span> {error}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {validationError && (
          <div 
            className="p-3 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2 text-xs"
            role="alert"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-8 flex justify-between gap-4 pt-4 border-t border-slate-800/60">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              disabled={loadingMissions}
              className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-900 hover:text-slate-100 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Return to previous question"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/15"
              aria-label="Proceed to next question"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loadingMissions}
              className="ml-auto px-8 py-3 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-75 disabled:cursor-wait"
              aria-label="Submit audit and load personalized missions"
            >
              {loadingMissions ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Missions...
                </>
              ) : (
                <>
                  Launch Quest <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
