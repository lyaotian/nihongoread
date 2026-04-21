import React from 'react';
import { Card, Typography, Button, Progress, List, Tag, Collapse, Space } from 'antd';
import { RotateCw, CheckCircle2, XCircle, ListChecks, Lightbulb, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { QuizData, UserAnswer } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface Props {
  answers: UserAnswer[];
  data: QuizData;
  onRestart: () => void;
}

export const Results: React.FC<Props> = ({ answers, data, onRestart }) => {
  const correctCount = answers.filter(a => a.isCorrect).length;
  const totalCount = answers.length;
  const percentage = Math.round((correctCount / totalCount) * 100);

  const getPerformanceMessage = () => {
    if (percentage === 100) return "素晴らしい！全問正解です。";
    if (percentage >= 80) return "惜しい！あと少しで満点でした。";
    if (percentage >= 60) return "合格です！よくできました。";
    return "お疲れ様でした。次はもっと頑張りましょう！";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-7xl mx-auto py-6 md:py-12 px-4 font-sans"
    >
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Left Column: Article */}
        <div className="w-full lg:w-5/12 xl:w-1/2 lg:sticky lg:top-24">
          <Card className="border border-[#f0f0f0] bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#f0f0f0]">
              <BookOpen className="text-[#1890ff]" size={20} />
              <Title level={4} className="!m-0 !font-bold text-[#262626]">読解文章</Title>
            </div>
            <div className="bg-[#fafafa] p-5 md:p-6 rounded-lg border border-[#f0f0f0] max-h-[50vh] lg:max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
              <div className="whitespace-pre-wrap">
                {data.article}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Score Summary & Answers */}
        <div className="w-full lg:w-7/12 xl:w-1/2 flex flex-col gap-6 md:gap-8">
          <Card className="!p-6 md:!p-10 border-none bg-gradient-to-br from-[#ffffff] to-[#f0f7ff] shadow-sm">
        <Space orientation="vertical" size="large" className="w-full text-center">
          <div>
            <div className="flex justify-center mb-3">
              <Tag color="orange" className="!text-[12px] !py-1 !px-4 !rounded-full !border-none !bg-orange-50 !text-orange-600 font-bold uppercase tracking-widest shadow-sm">JLPT {data.level} レベル</Tag>
            </div>
            <Title level={3} className="md:!text-3xl !font-bold !text-[#262626] !mb-1">結果確認</Title>
            <Text className="text-[#8c8c8c] text-sm md:text-base">{getPerformanceMessage()}</Text>
          </div>

          <div className="flex justify-center py-4 md:py-6">
            <Progress 
              type="circle" 
              percent={percentage} 
              strokeColor="#1890ff"
              strokeWidth={8}
              size={window.innerWidth < 640 ? 140 : 180}
              format={(p) => (
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold text-[#262626]">{correctCount}/{totalCount}</span>
                  <span className="text-xs md:text-sm text-[#8c8c8c] font-normal">正解</span>
                </div>
              )}
            />
          </div>

          <Button 
            type="primary" 
            size="large" 
            onClick={onRestart}
            className="w-full max-w-[240px] h-[44px] md:h-[48px] !rounded-[4px] text-base md:text-lg font-medium mx-auto"
          >
            もう一度練習する
          </Button>
        </Space>
      </Card>

      <div className="space-y-4">
        <Title level={4} className="!text-lg md:!text-xl !font-semibold !text-[#262626] px-2 mb-4">解答一覧</Title>
        {data.questions.map((q, idx) => {
          const userAnswer = answers[idx];
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="!p-5 md:!p-6 border border-[#f0f0f0]">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-6">
                  <div className="flex-1">
                    <div className="text-[11px] md:text-[12px] text-[#8c8c8c] uppercase mb-1">質問 {idx + 1}</div>
                    <div className="text-[15px] md:text-[16px] font-bold text-[#262626]">{q.question}</div>
                  </div>
                  {userAnswer.isCorrect ? (
                    <Tag color="success" className="!rounded-sm !border-none px-3 !bg-[#f6ffed] !text-[#52c41a] !m-0">正解</Tag>
                  ) : (
                    <Tag color="error" className="!rounded-sm !border-none px-3 !bg-[#fff1f0] !text-[#ff4d4f] !m-0">不正解</Tag>
                  )}
                </div>

                <div className="space-y-2">
                  {q.options.map((option, optIdx) => {
                    const isCorrect = optIdx === q.correctAnswerIndex;
                    const isSelected = optIdx === userAnswer.selectedOptionIndex;
                    
                    let statusClass = "border-[#f0f0f0] bg-white";
                    let icon = null;

                    if (isCorrect) {
                      statusClass = "border-[#b7eb8f] bg-[#f6ffed] text-[#52c41a]";
                      icon = <CheckCircle2 size={16} className="ml-auto" />;
                    } else if (isSelected && !isCorrect) {
                      statusClass = "border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]";
                      icon = <XCircle size={16} className="ml-auto" />;
                    }

                    return (
                      <div 
                        key={optIdx} 
                        className={`p-3 rounded-[4px] border text-sm flex items-center gap-3 transition-colors ${statusClass}`}
                      >
                        <span className="opacity-50 text-[12px]">{String.fromCharCode(65 + optIdx)})</span>
                        <span className="flex-1">{option}</span>
                        {icon}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb size={14} />
                    解説
                  </div>
                  <div className="text-[14px] text-gray-600 leading-relaxed">
                    {q.explanation}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
        </div>
      </div>
    </motion.div>
  );
};
