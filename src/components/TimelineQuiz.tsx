"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppState } from "@/app/providers";
import { 
  HelpCircle, 
  ArrowRight, 
  Award, 
  TreeDeciduous,
  Factory,
  Car,
  Server,
  Trash2,
  Hourglass
} from "lucide-react";

interface Epoch {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  details: string;
  stat: string;
  color: string;
}

const EPOCHS: Epoch[] = [
  {
    year: "1850",
    title: "Living Planet Era",
    description: "Pristine natural systems cover the globe. Industrialization has not yet altered the atmosphere.",
    icon: TreeDeciduous,
    details: "Global atmospheric carbon concentrations hover at a safe 280 ppm. Ecosystems absorb carbon seamlessly, and global temperatures remain stable.",
    stat: "Carbon index: 280 ppm (Pre-industrial baseline)",
    color: "from-emerald-400 to-teal-500",
  },
  {
    year: "1900",
    title: "Coal & Steam Revolution",
    description: "The steam engine triggers massive coal combustion to power factories and railways.",
    icon: Factory,
    details: "Atmospheric CO2 climbs to 295 ppm. Heavy machinery and locomotives become the primary drivers of localized smog and fuel extraction.",
    stat: "Global emissions: ~2 Billion metric tons/year",
    color: "from-slate-400 to-zinc-600",
  },
  {
    year: "1950",
    title: "The Machine Age",
    description: "Oil reserves are tapped. Mass production of gasoline automobiles and aviation begins.",
    icon: Car,
    details: "CO2 reaches 310 ppm. Household convenience items, flight travel, and suburbs expand. The carbon footprint of the average person climbs dramatically.",
    stat: "Global emissions: ~6 Billion metric tons/year",
    color: "from-blue-400 to-indigo-600",
  },
  {
    year: "2000",
    title: "The Connected World",
    description: "Global supply chains, server farms, and internet traffic expand carbon loads worldwide.",
    icon: Server,
    details: "CO2 is at 370 ppm. Modern shipping, digital infrastructure, and globalization create a highly integrated, high-energy global grid.",
    stat: "Global emissions: ~25 Billion metric tons/year",
    color: "from-purple-400 to-violet-600",
  },
  {
    year: "2026",
    title: "The Consumption Era",
    description: "AI datacenters drawing gigawatts, fast fashion, and hyper-convenient deliveries push indices.",
    icon: Trash2,
    details: "Atmospheric CO2 sits at an alarming 424 ppm. Massive server loads for artificial intelligence models, single-use shipping, and quick delivery compound our footprint.",
    stat: "Global emissions: ~37 Billion metric tons/year",
    color: "from-rose-400 to-pink-600",
  },
  {
    year: "2050",
    title: "The Split (The Choice)",
    description: "Two potential paths: run-away warming or matched 100% circular, carbon-free energy grids.",
    icon: Hourglass,
    details: "If we maintain our trajectory, warming exceeds 2.5°C, collapsing ecosystems. If we act, we hit net-zero, rewilding nature and stabilizing our home.",
    stat: "Your emissions: 0 kg (Target) vs 8,000 kg (Collapse)",
    color: "from-amber-400 to-emerald-500",
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which sector accounts for the largest share of global greenhouse gas emissions?",
    options: [
      "Transportation (Cars, Trains, Planes)",
      "Energy & Electricity production",
      "Agriculture, Forestry, & Land Use"
    ],
    correctIndex: 1,
    explanation: "Energy and electricity production (burning fossil fuels) remains the largest single source of global emissions, accounting for roughly 25-30%."
  },
  {
    question: "Under the Paris Agreement, what is the target individual annual footprint to limit warming to 1.5°C?",
    options: [
      "10,000 kg CO2e per person",
      "4,000 kg CO2e per person",
      "2,000 kg CO2e per person"
    ],
    correctIndex: 2,
    explanation: "The global average footprint is currently about 4,000 kg. To achieve the 1.5°C goal, we must cut our individual average to 2,000 kg by 2050."
  },
  {
    question: "What is 'Standby' or 'Vampire' power draw in households?",
    options: [
      "Electricity pulled by appliances while turned off but still plugged in",
      "Extra power consumed during high-demand nighttime hours",
      "Electricity leaks from old solar panels under moonlight"
    ],
    correctIndex: 0,
    explanation: "Vampire power draw accounts for up to 10% of household electricity bills. Unplugging standby electronics stops this waste."
  }
];

export default function TimelineQuiz() {
  const { proceedToAudit } = useAppState();
  const shouldReduceMotion = useReducedMotion();
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [quizActive, setQuizActive] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const activeEpoch = EPOCHS[currentEpoch];
  const EpochIcon = activeEpoch.icon;

  const handleNextQuestion = () => {
    if (selectedOption === QUIZ_QUESTIONS[currentQuestion].correctIndex) {
      setScore((prev) => prev + 50);
    }
    
    setSelectedOption(null);
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction > 0 ? 200 : -200,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: (direction: number) => ({
      x: shouldReduceMotion ? 0 : direction < 0 ? 200 : -200,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section 
      className="w-full max-w-4xl mx-auto px-4 py-6"
      aria-label="Interactive Carbon Timeline and Quiz"
    >
      <AnimatePresence mode="wait">
        {!quizActive ? (
          <motion.div
            key="timeline-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Step 1: The Chronology
              </span>
              <h2 className="text-3xl font-black text-slate-100 font-heading">
                Explore the Epochs of Climate Change
              </h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Before auditing your current footprint, walk through how carbon emissions transformed our planet and set the stage for your EcoQuest.
              </p>
            </div>

            {/* Timeline Bar Navigation */}
            <div 
              className="flex justify-between items-center relative py-4 max-w-2xl mx-auto"
              role="tablist"
              aria-label="Select an epoch to view details"
            >
              {/* Connecting line */}
              <div className="absolute left-0 right-0 h-0.5 bg-slate-800 z-0" />
              <div 
                className="absolute left-0 h-0.5 bg-emerald-500 transition-all duration-300 z-0"
                style={{ width: `${(currentEpoch / (EPOCHS.length - 1)) * 100}%` }}
              />

              {EPOCHS.map((epoch, idx) => {
                const isActive = idx === currentEpoch;
                const isViewed = idx < currentEpoch;

                return (
                  <button
                    key={epoch.year}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`View Epoch ${epoch.year}: ${epoch.title}`}
                    onClick={() => setCurrentEpoch(idx)}
                    className={`relative z-10 w-9 h-9 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                      isActive 
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 scale-110 shadow-lg shadow-emerald-500/30"
                        : isViewed
                          ? "bg-slate-900 border-emerald-600 text-emerald-400"
                          : "bg-slate-950 border-slate-700 text-slate-500"
                    }`}
                  >
                    {epoch.year}
                  </button>
                );
              })}
            </div>

            {/* Epoch Content Display Card */}
            <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden min-h-[300px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 to-transparent pointer-events-none" />
              
              <AnimatePresence mode="wait" custom={currentEpoch}>
                <motion.div
                  key={currentEpoch}
                  custom={currentEpoch}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 relative z-10"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${activeEpoch.color} text-slate-950`}>
                        <EpochIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-emerald-400 font-extrabold text-xs tracking-wider uppercase">
                          Epoch {activeEpoch.year}
                        </span>
                        <h3 className="text-2xl font-black text-slate-100 font-heading">
                          {activeEpoch.title}
                        </h3>
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">Atmospheric Index</span>
                      <span className="text-sm font-extrabold text-slate-300">{activeEpoch.stat}</span>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    {activeEpoch.description}
                  </p>

                  <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-900 text-xs text-slate-400 leading-relaxed">
                    {activeEpoch.details}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation and Next Button */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setCurrentEpoch((prev) => Math.max(0, prev - 1))}
                disabled={currentEpoch === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-semibold text-sm hover:bg-slate-900 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous Era
              </button>

              {currentEpoch < EPOCHS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentEpoch((prev) => Math.min(EPOCHS.length - 1, prev + 1))}
                  className="px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 hover:border-slate-700 hover:text-slate-100 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  Next Era <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setQuizActive(true)}
                  className="px-7 py-3 bg-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Take Carbon Quiz <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quiz-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Quiz Container */}
            {!quizFinished ? (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
                    <span className="text-emerald-400">Bonus points potential: +150 XP</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${((currentQuestion) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question Details */}
                <div className="glass rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                  <h3 className="text-xl font-bold text-slate-100 font-heading">
                    {QUIZ_QUESTIONS[currentQuestion].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3" role="radiogroup" aria-label="Quiz Options">
                    {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => {
                      const isSelected = selectedOption === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${
                            isSelected 
                              ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/5 text-emerald-300" 
                              : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 text-slate-300"
                          }`}
                        >
                          <span>{option}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 ${isSelected ? "border-emerald-400" : "border-slate-600"}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit option / Next question controls */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizActive(false);
                      setCurrentQuestion(0);
                      setSelectedOption(null);
                      setScore(0);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 font-semibold text-sm hover:bg-slate-900 hover:text-slate-200 transition-all cursor-pointer"
                  >
                    Back to Timeline
                  </button>

                  <button
                    type="button"
                    disabled={selectedOption === null}
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-bold text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Answer <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Quiz Finished Summary */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto text-center space-y-6 glass rounded-2xl p-8 shadow-2xl border border-emerald-500/20"
              >
                <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
                  <Award className="w-12 h-12" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-100 font-heading">
                    Quiz Complete!
                  </h3>
                  <p className="text-slate-400 text-xs">
                    You&apos;ve finished the Carbon Literacy Quiz. Here is your offset starting score:
                  </p>
                </div>

                {/* Score panel */}
                <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-900 space-y-2">
                  <span className="text-4xl font-extrabold text-emerald-400">+{score} XP</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Starting Carbon Offset Bonus
                  </span>
                  <div className="text-slate-400 text-xs pt-3 leading-relaxed border-t border-slate-900/60">
                    {score === 150 ? (
                      <span className="text-emerald-400 font-semibold">Perfect Score! 🌟 You possess advanced carbon knowledge.</span>
                    ) : score >= 100 ? (
                      <span className="text-teal-400 font-semibold">Well done! 👍 Excellent ecological understanding.</span>
                    ) : (
                      <span>Nice try! 🌿 Every small step counts towards ecological education.</span>
                    )}
                  </div>
                </div>

                {/* Proceed to Audit Button */}
                <button
                  type="button"
                  onClick={() => proceedToAudit(score)}
                  className="w-full py-3 bg-emerald-500 text-slate-950 font-extrabold text-sm rounded-xl hover:bg-emerald-400 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-emerald-500/20"
                >
                  Proceed to Carbon Audit <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
