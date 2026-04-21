/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConfigProvider, Layout, Typography, Spin, message, Button, Modal, Input } from 'antd';
import { AnimatePresence } from 'motion/react';
import { ArticleInput } from './components/ArticleInput';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { History } from './components/History';
import { generateQuiz, hasApiKey, setApiKey } from './services/geminiService';
import { dbService } from './services/dbService';
import { AppState, QuizData, UserAnswer, QuizHistoryItem, JLPTLevel } from './types';
import { Languages, History as HistoryIcon, Settings as SettingsIcon } from 'lucide-react';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function App() {
  const [state, setState] = useState<AppState>('input');
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [pendingQuizParams, setPendingQuizParams] = useState<{article: string, level: JLPTLevel} | null>(null);

  const handleGenerate = async (article: string, level: JLPTLevel) => {
    if (!hasApiKey()) {
      setPendingQuizParams({ article, level });
      setApiKeyModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const data = await generateQuiz(article, level);
      setQuizData(data);
      setState('quiz');
      message.success('問題が作成されました！頑張りましょう。');
    } catch (error) {
      console.error(error);
      message.error(error instanceof Error ? error.message : '予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      message.error("APIキーを入力してください。");
      return;
    }
    setApiKey(tempApiKey.trim());
    setApiKeyModalVisible(false);
    setTempApiKey('');
    message.success("APIキーを保存しました。");
    
    if (pendingQuizParams) {
      handleGenerate(pendingQuizParams.article, pendingQuizParams.level);
      setPendingQuizParams(null);
    }
  };

  const handleQuizFinish = async (userAnswers: UserAnswer[]) => {
    setAnswers(userAnswers);
    setState('results');

    // Save to history
    if (quizData) {
      try {
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        await dbService.saveQuiz({
          timestamp: Date.now(),
          article: quizData.article,
          questions: quizData.questions,
          level: quizData.level,
          answers: userAnswers,
          score: correctCount,
          total: userAnswers.length
        });
      } catch (error) {
        console.error('Failed to save to history:', error);
      }
    }
  };

  const handleHistoryViewDetails = (item: QuizHistoryItem) => {
    setQuizData({
      article: item.article,
      questions: item.questions,
      level: item.level,
    });
    setAnswers(item.answers);
    setState('results');
  };

  const handleRestart = () => {
    setQuizData(null);
    setAnswers([]);
    setState('input');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: `"Inter", "PingFang SC", "Hiragino Sans", "Microsoft YaHei", sans-serif`,
        },
      }}
    >
      <Layout className="min-h-screen bg-[#f0f2f5]">
        <Header className="!bg-white h-auto py-4 md:h-[64px] md:py-0 border-b border-[#f0f0f0] px-4 md:px-8 flex flex-col md:flex-row items-center justify-between sticky top-0 z-50 shadow-[0_2px_8px_rgba(0,0,0,0.06)] gap-4 md:gap-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleRestart}>
            <div className="text-[#1890ff] font-bold text-xl flex items-center gap-2">
              <span className="text-2xl">読</span>
              <span>ReadWise JP</span>
            </div>
          </div>
          
          <div className="flex gap-4 sm:gap-6 md:gap-10 overflow-x-auto max-w-full pb-2 md:pb-0 px-2">
            <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0 ${state === 'input' ? 'text-[#1890ff] font-medium' : 'text-[#8c8c8c]'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 border rounded-full flex items-center justify-center text-[10px] sm:text-xs ${state === 'input' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-[#8c8c8c]'}`}>1</span>
              文章入力
            </div>
            <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0 ${state === 'quiz' ? 'text-[#1890ff] font-medium' : 'text-[#8c8c8c]'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 border rounded-full flex items-center justify-center text-[10px] sm:text-xs ${state === 'quiz' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-[#8c8c8c]'}`}>2</span>
              問題回答
            </div>
            <div className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0 ${state === 'results' ? 'text-[#1890ff] font-medium' : 'text-[#8c8c8c]'}`}>
              <span className={`w-5 h-5 sm:w-6 sm:h-6 border rounded-full flex items-center justify-center text-[10px] sm:text-xs ${state === 'results' ? 'bg-[#1890ff] text-white border-[#1890ff]' : 'border-[#8c8c8c]'}`}>3</span>
              結果確認
            </div>
          </div>

          <div className="flex items-center">
            <Button 
              type="text" 
              icon={<HistoryIcon size={18} />} 
              onClick={() => setState('history')}
              className={state === 'history' ? '!text-[#1890ff]' : '!text-[#8c8c8c]'}
            >
              <span className="hidden sm:inline ml-1">学習履歴</span>
            </Button>
            <Button 
              type="text" 
              icon={<SettingsIcon size={18} />} 
              onClick={() => {
                setApiKeyModalVisible(true);
                const oldKey = localStorage.getItem('GEMINI_API_KEY');
                if (oldKey) {
                  setTempApiKey(oldKey);
                }
              }}
              className="!text-[#8c8c8c] hover:!text-[#1890ff]"
            >
              <span className="hidden sm:inline ml-1">設定</span>
            </Button>
          </div>
        </Header>

        <Content className="pt-8 pb-16">
          <AnimatePresence mode="wait">
            {state === 'input' && (
              <ArticleInput 
                key="input" 
                onGenerate={handleGenerate} 
                loading={loading} 
              />
            )}
            {state === 'quiz' && quizData && (
              <Quiz 
                key="quiz" 
                data={quizData} 
                onFinish={handleQuizFinish} 
              />
            )}
            {state === 'results' && quizData && (
              <Results 
                key="results" 
                answers={answers} 
                data={quizData} 
                onRestart={handleRestart} 
              />
            )}
            {state === 'history' && (
              <History
                key="history"
                onViewDetails={handleHistoryViewDetails}
                onBack={handleRestart}
              />
            )}
          </AnimatePresence>
        </Content>

        <Footer className="text-center text-gray-400 py-8 bg-transparent">
          NihongoRead &copy; {new Date().getFullYear()} - 日本語読解トレーニングツール
        </Footer>

        {loading && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex flex-col items-center justify-center text-white">
            <Spin size="large" className="mb-6" />
            <div className="text-xl font-medium animate-pulse">
              AIが問題を生成しています...
            </div>
          </div>
        )}

        <Modal
          title="Gemini APIキーの設定"
          open={apiKeyModalVisible}
          onOk={handleSaveApiKey}
          onCancel={() => {
            setApiKeyModalVisible(false);
            setTempApiKey('');
            setPendingQuizParams(null);
          }}
          okText="保存して続ける"
          cancelText="キャンセル"
          maskClosable={false}
        >
          <p className="mb-4 text-gray-600">
            AIモデルを利用して問題を生成するために、Google GeminiのAPIキーが必要です。<br />
            APIキーはブラウザのローカルストレージにのみ保存され、サーバーには送信されません。
          </p>
          <Input.Password
            placeholder="AIzaSy..."
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            onPressEnter={handleSaveApiKey}
          />
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}

