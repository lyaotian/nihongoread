import React, { useState } from 'react';
import { Input, Button, Card, Typography, Space, message, Slider } from 'antd';
import { BookOpen, Send, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { JLPTLevel } from '../types';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

interface Props {
  onGenerate: (article: string, level: JLPTLevel) => Promise<void>;
  loading: boolean;
}

export const ArticleInput: React.FC<Props> = ({ onGenerate, loading }) => {
  const [text, setText] = useState('');
  const [levelValue, setLevelValue] = useState(() => {
    const saved = localStorage.getItem('jlptLevelValue');
    return saved ? parseInt(saved, 10) : 1;
  });

  const handleLevelChange = (value: number) => {
    setLevelValue(value);
    localStorage.setItem('jlptLevelValue', value.toString());
  };

  const levelMap: Record<number, JLPTLevel> = {
    1: 'N3',
    2: 'N2',
    3: 'N1'
  };

  const handleSubmit = () => {
    if (!text.trim()) {
      message.warning('文章を入力してください。');
      return;
    }
    if (text.length < 50) {
      message.warning('文章が短すぎます。もう少し長い文章を入力してください（目安：50文字以上）。');
      return;
    }
    onGenerate(text, levelMap[levelValue]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto py-6 md:py-12 px-4"
    >
      <Card className="shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-none rounded-lg p-6 md:p-8 bg-white">
        <Space orientation="vertical" size="large" className="w-full">
          <div className="text-center mb-4 md:mb-6">
            <Title level={3} className="!text-xl md:!text-2xl !font-bold !text-[#262626] !mb-2">文章入力</Title>
            <Paragraph className="text-[#8c8c8c] text-sm md:text-base">
              読解練習用の日本語テキストを入力してください。
            </Paragraph>
          </div>

          <TextArea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="ここに日本語の文章を貼り付けてください..."
            autoSize={{ minRows: 10, maxRows: 24 }}
            className="!rounded-[4px] !border-[#f0f0f0] !text-[14px] md:!text-[16px] !p-3 md:!p-4 hover:!border-[#1890ff] focus:!border-[#1890ff] focus:!shadow-none"
            disabled={loading}
          />
          <div className="px-2 py-4">
            <div className="flex items-center gap-2 mb-6 text-[#262626] font-medium">
              <GraduationCap size={18} className="text-[#1890ff]" />
              <span>レベル設定</span>
            </div>
            <Slider
              min={1}
              max={3}
              step={1}
              value={levelValue}
              onChange={handleLevelChange}
              tooltip={{ open: false }}
              marks={{
                3: {
                  style: { color: levelValue === 3 ? '#1890ff' : '#8c8c8c', fontWeight: levelValue === 1 ? '600' : '400' },
                  label: 'N1'
                },
                2: {
                  style: { color: levelValue === 2 ? '#1890ff' : '#8c8c8c', fontWeight: levelValue === 2 ? '600' : '400' },
                  label: 'N2'
                },
                1: {
                  style: { color: levelValue === 1 ? '#1890ff' : '#8c8c8c', fontWeight: levelValue === 1 ? '600' : '400' },
                  label: 'N3'
                }
              }}
              className="mt-2 mb-8 mx-4"
              disabled={loading}
            />
          </div>
          <div className="flex justify-center pt-2 md:pt-4">
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              className="w-full h-[40px] md:h-[44px] !rounded-[4px] text-sm md:text-base font-medium"
            >
              問題を作成する
            </Button>
          </div>
        </Space>
      </Card>
    </motion.div>
  );
};
