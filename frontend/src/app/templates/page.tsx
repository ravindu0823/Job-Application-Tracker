'use client';

import { motion } from 'framer-motion';

export default function TemplatesPage() {
  const templates = [
    'General Software Engineer',
    'Frontend Developer',
    'Backend .NET',
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Application Templates</h2>
        <p className="text-neutral-500">Save and reuse common application details.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, idx) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1, ease: 'easeOut' }}
            whileHover={{ scale: 1.01 }}
            className="border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-500 ease-out rounded-lg backdrop-blur-sm"
          >
            <motion.div
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-6 rounded-xl transition-all duration-500 ease-in-out"
            >
              <div className="font-semibold mb-1">{t}</div>
              <p className="text-sm text-neutral-600">Preset fields for quick apply.</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
