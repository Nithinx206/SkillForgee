import React, { useState, useRef, useCallback } from 'react';
import { ICONS } from '../constants';
import { analyzeInput } from '../services/geminiService';
import { Task, TaskCategory, Priority } from '../types';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface InputSectionProps {
  onTasksGenerated: (tasks: Task[]) => void;
  setLoading: (loading: boolean, message: string | null) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onTasksGenerated, setLoading }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, overrideAudio?: string) => {
    if (e) e.preventDefault();
    
    // Determine what we are sending
    const audioToSend = overrideAudio || null;
    const imageToSend = selectedImage ? selectedImage.split(',')[1] : null; // Remove data URL prefix
    
    if (!inputText.trim() && !imageToSend && !audioToSend) return;

    setLoading(true, "Analyzing your input with Gemini...");

    try {
      const response = await analyzeInput(
        inputText || null,
        imageToSend,
        audioToSend
      );

      const newTasks: Task[] = response.tasks.map(t => ({
        id: generateId(),
        title: t.title,
        description: t.description,
        category: t.category as TaskCategory,
        priority: t.priority as Priority,
        deadline: t.deadline || undefined,
        estimatedMinutes: t.estimatedMinutes,
        completed: false,
        createdAt: new Date().toISOString()
      }));

      onTasksGenerated(newTasks);
      
      // Reset form
      setInputText('');
      setSelectedImage(null);
    } catch (error) {
      console.error("Input processing failed:", error);
      alert("Something went wrong processing your input. Please try again.");
    } finally {
      setLoading(false, null);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          // Automatically submit audio after recording stops
          handleSubmit(undefined, base64Audio);
        };
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
      };
    }
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 transition-all hover:shadow-md">
      <form onSubmit={(e) => handleSubmit(e)}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="What needs to be done? (e.g. 'Book dentist for Tuesday', 'Plan birthday party')"
          className="w-full text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none text-lg bg-transparent"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {selectedImage && (
          <div className="relative inline-block mt-2">
            <img src={selectedImage} alt="Upload preview" className="h-20 w-auto rounded-lg border border-slate-200 dark:border-slate-700" />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-full transition-colors"
              title="Upload Image"
            >
              {ICONS.Image}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-2 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-100 text-red-600 animate-pulse dark:bg-red-900/30 dark:text-red-400' 
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'
              }`}
              title="Record Audio"
            >
              {ICONS.Mic}
            </button>
            {isRecording && <span className="text-xs text-red-500 font-medium">Recording...</span>}
          </div>

          <button
            type="submit"
            disabled={!inputText && !selectedImage}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              !inputText && !selectedImage
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg dark:bg-indigo-500 dark:hover:bg-indigo-600'
            }`}
          >
            <span>Organize</span>
            {ICONS.Send}
          </button>
        </div>
      </form>
    </div>
  );
};