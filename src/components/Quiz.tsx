import React, { useState } from 'react';
import { Card, Typography, Radio, Button, Space, Divider, Steps, Tag } from 'antd';
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QuizData, UserAnswer } from '../types';

const { Title, Paragraph, Text } = Typography;

interface Props {
  data: QuizData;
  onFinish: (answers: UserAnswer[]) => void;
}

export const Quiz: React.FC<Props> = ({ data, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | undefined)[]>(new Array(data.questions.length).fill(undefined));

  const handleOptionChange = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  };

  const next = () => setCurrentStep(prev => prev + 1);
  const prev = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = () => {
    const finalAnswers: UserAnswer[] = data.questions.map((q, idx) => ({
      questionId: q.id,
      selectedOptionIndex: answers[idx]!,
      isCorrect: answers[idx] === q.correctAnswerIndex
    }));
    onFinish(finalAnswers);
  };

  const isAllAnswered = answers.every(a => a !== undefined);
  const correctCountSoFar = answers.filter((a, idx) => a !== undefined && a === data.questions[idx].correctAnswerIndex).length;
  const answeredCount = answers.filter(a => a !== undefined).length;
  const accuracy = answeredCount > 0 ? Math.round((correctCountSoFar / answeredCount) * 100) : 0;

  return (
    <div className="max-w-[1200px] mx-auto py-4 md:py-6 px-4 md:px-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
      {/* Reading Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-lg p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.03)] h-auto lg:h-[calc(100vh-160px)] flex flex-col"
      >
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 pb-3 border-b border-[#f0f0f0]">本文</h1>
        <article className="reading-body-text flex-1 overflow-y-auto pr-2 max-h-[300px] lg:max-h-none text-sm md:text-base leading-relaxed">
          {data.article}
        </article>
      </motion.div>

      {/* Question Section */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="!p-4 sm:!p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-[#8c8c8c]">質問 {currentStep + 1} / {data.questions.length}</span>
                <Tag color="orange" className="!text-[10px] sm:!text-[11px] !leading-relaxed !rounded-sm !border-none !bg-orange-50 !text-orange-600 font-bold uppercase tracking-wider">JLPT N1</Tag>
              </div>
              <span className="text-xs sm:text-sm text-[#1890ff] font-medium">進行中</span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="min-h-0 sm:min-h-[320px] flex flex-col"
              >
                <div className="text-sm sm:text-base font-bold mb-4 sm:mb-6 text-[#262626]">
                  {data.questions[currentStep].question}
                </div>
                
                <Radio.Group 
                  onChange={(e) => handleOptionChange(e.target.value)} 
                  value={answers[currentStep]}
                  className="w-full flex-1"
                >
                  <Space orientation="vertical" className="w-full">
                    {data.questions[currentStep].options.map((option, idx) => (
                      <Radio.Button
                        key={idx}
                        value={idx}
                        className="w-full !h-auto !py-3"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border transition-all flex-shrink-0 flex items-center justify-center ${
                            answers[currentStep] === idx ? 'border-[#1890ff] border-[4px] sm:border-[5px]' : 'border-[#d9d9d9] bg-white'
                          }`} />
                          <span className="text-[13px] sm:text-[14px] leading-snug whitespace-normal text-left">{option}</span>
                        </div>
                      </Radio.Button>
                    ))}
                  </Space>
                </Radio.Group>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-[#fafafa] border border-[#f0f0f0] p-4 rounded-lg">
            <div className="flex justify-between text-[12px] sm:text-[13px] mb-2 font-sans">
              <span>現在の正解率予想</span>
              <span className="font-bold">{accuracy}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#1890ff] transition-all duration-500" 
                style={{ width: `${accuracy}%` }} 
              />
            </div>
            <div className="mt-3 text-[11px] sm:text-[12px] text-[#8c8c8c]">
              残り {data.questions.length - answeredCount} 問あります。頑張りましょう！
            </div>
          </div>
        </motion.div>

        {/* Action Bar */}
        <div className="flex justify-between sm:justify-end gap-2 sm:gap-3 pt-2">
          <Button 
            size="large"
            onClick={prev} 
            disabled={currentStep === 0}
            className="flex-1 sm:flex-none sm:w-[100px] h-[40px] md:h-[44px] text-sm md:text-base"
          >
            戻る
          </Button>
          
          {currentStep < data.questions.length - 1 ? (
            <Button 
              type="primary"
              size="large"
              onClick={next}
              disabled={answers[currentStep] === undefined}
              className="flex-1 sm:flex-none sm:w-[140px] h-[40px] md:h-[44px] text-sm md:text-base"
            >
              次の問題へ
            </Button>
          ) : (
            <Button 
              type="primary"
              size="large"
              onClick={handleSubmit}
              disabled={!isAllAnswered}
              className="flex-1 sm:flex-none sm:w-[140px] h-[40px] md:h-[44px] text-sm md:text-base"
            >
              終了する
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
