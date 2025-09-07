'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Link from 'next/link';

interface AuthPopInProps {
  isOpen: boolean;
  onClose: () => void;
  message: React.ReactNode;
  buttonText: string;
  link: string;
}

const AuthPopIn: React.FC<AuthPopInProps> = ({ isOpen, onClose, message, buttonText, link }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="fixed top-1/4 left-4 z-50 w-full max-w-xs rounded-lg bg-white p-6 shadow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col gap-4">
          <div>{message}</div>
          <Link href={link} passHref>
            <Button className="w-full" child={buttonText} />
          </Link>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AuthPopIn;
