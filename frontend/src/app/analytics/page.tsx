"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const stats = [
    {
      title: 'Response Rate',
      value: '33%',
      subtitle: '8 responses from 24 applications',
      icon: <TrendingUp className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: 'Interview Rate',
      value: '25%',
      subtitle: '6 interviews from 24 applications',
      icon: <Target className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: 'Offer Rate',
      value: '8%',
      subtitle: '2 offers from 24 applications',
      icon: <Award className="h-4 w-4 text-neutral-500" />,
    },
    {
      title: 'Avg Response Time',
      value: '5 days',
      subtitle: 'From application to response',
      icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm md:text-base text-neutral-500">
          Track your job search progress and insights
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{
              scale: 1.015, // reduced from 1.03 for smoother feel
              y: -2, // smaller vertical lift
              transition: { duration: 0.25, ease: 'easeOut' },
            }}
          >
            <Card className="touch-manipulation border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300 ease-out">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold transition-all duration-300 ease-in-out">
                  {stat.value}
                </div>
                <p className="text-xs text-neutral-500">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
      >
        <Card className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            >
              <BarChart3 className="h-16 w-16 text-neutral-400 mb-4" />
            </motion.div>
            <h3 className="text-base md:text-lg font-semibold mb-2 text-center">
              Detailed Analytics Coming Soon
            </h3>
            <p className="text-sm md:text-base text-neutral-500 text-center max-w-md px-4">
              Advanced charts and visualizations including timeline graphs, status distributions,
              and salary insights will be available soon.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
