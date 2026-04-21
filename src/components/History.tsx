import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Button, Tag, Space, Empty, Popconfirm, message } from 'antd';
import { History as HistoryIcon, Calendar, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../services/dbService';
import { QuizHistoryItem } from '../types';

const { Title, Text } = Typography;

interface Props {
  onViewDetails: (item: QuizHistoryItem) => void;
  onBack: () => void;
}

export const History: React.FC<Props> = ({ onViewDetails, onBack }) => {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await dbService.getHistory();
      setHistory(data);
    } catch (error) {
      message.error('履歴の読み込みに失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dbService.deleteQuiz(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      message.success('履歴を削除しました。');
    } catch (error) {
      message.error('削除に失敗しました。');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-6 md:py-12 px-4"
    >
      <div className="flex items-center justify-between mb-8">
        <Space size="middle">
          <Button icon={<ArrowLeft size={16} />} onClick={onBack} type="text">戻る</Button>
          <div className="flex items-center gap-2">
            <HistoryIcon className="text-[#1890ff]" size={24} />
            <Title level={3} className="!m-0">学習履歴</Title>
          </div>
        </Space>
        <Text className="text-[#8c8c8c]">全 {history.length} 件の記録</Text>
      </div>

      {loading ? (
        <Card loading={true} className="border-none shadow-sm" />
      ) : history.length === 0 ? (
        <Card className="border-none shadow-sm py-16 text-center">
          <Empty description="まだ学習履歴がありません。文章を入力して練習を始めましょう！" />
        </Card>
      ) : (
        <List<QuizHistoryItem>
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={history}
          renderItem={(item) => (
            <List.Item>
              <Card 
                hoverable 
                className="border-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-md transition-all group"
                onClick={() => onViewDetails(item)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Space className="mb-2 flex-wrap">
                      <Tag icon={<Calendar size={12} className="mr-1" />} bordered={false} className="!bg-[#f5f5f5] !text-[#595959]">
                        {formatDate(item.timestamp)}
                      </Tag>
                      <Tag color="orange" bordered={false} className="!bg-orange-50 !text-orange-600 font-bold">JLPT {item.level}</Tag>
                      <Tag color={item.score / item.total >= 0.8 ? 'success' : 'processing'} bordered={false}>
                        スコア: {item.score}/{item.total} ({Math.round(item.score/item.total*100)}%)
                      </Tag>
                    </Space>
                    <Title level={4} className="!mb-2 line-clamp-1 !text-lg !font-bold text-[#262626]">
                      {item.article}
                    </Title>
                  </div>
                  <div className="flex items-center gap-4">
                    <Popconfirm
                      title="履歴を削除しますか？"
                      onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(item.id);
                      }}
                      onCancel={(e) => e?.stopPropagation()}
                      okText="削除"
                      cancelText="キャンセル"
                      okButtonProps={{ danger: true }}
                    >
                      <Button 
                        type="text" 
                        danger 
                        icon={<Trash2 size={18} />} 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                    <ChevronRight className="text-[#bfbfbf] group-hover:text-[#1890ff] transition-colors" size={24} />
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </motion.div>
  );
};
