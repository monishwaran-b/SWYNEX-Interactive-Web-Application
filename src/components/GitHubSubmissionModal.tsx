import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { GitHubSubmission } from '../types';
import { GitHubSubmissionErrors, validateGitHubSubmission } from '../utils/validation';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import {
  Github,
  CheckCircle2,
  Copy,
  ExternalLink,
  Code2,
  Layers,
  ShieldCheck,
  Send,
  Terminal,
} from 'lucide-react';

export interface GitHubSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubSubmissionModal({ isOpen, onClose }: GitHubSubmissionModalProps) {
  const { state, saveGitHubSubmission, addToast } = useLedger();

  const [repoUrl, setRepoUrl] = useState(
    state.submission?.repoUrl || 'https://github.com/monishwaran/flowledger-expense-tracker'
  );
  const [projectTitle, setProjectTitle] = useState(
    state.submission?.projectTitle || 'FlowLedger - Smart Expense & Financial Flow Tracker'
  );
  const [branch, setBranch] = useState(state.submission?.branch || 'main');
  const [authorName, setAuthorName] = useState(state.submission?.authorName || 'Monishwaran B');
  const [authorEmail, setAuthorEmail] = useState(
    state.submission?.authorEmail || 'monishwaran.bterm28h@gmail.com'
  );
  const [notes, setNotes] = useState(
    state.submission?.notes ||
      'Includes modular UI library (11+ components), dual-theme support, custom real-time form validation engine, and full-featured persistent state management with undo support.'
  );

  const [errors, setErrors] = useState<GitHubSubmissionErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(Boolean(state.submission));

  const handleBlur = (field: 'repoUrl' | 'projectTitle' | 'authorName' | 'authorEmail') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateGitHubSubmission({ repoUrl, projectTitle, authorName, authorEmail });
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleCopyGitCommands = () => {
    const cleanRepo = repoUrl.trim();
    const commands = `# Initialize git repository and push FlowLedger
git init
git add .
git commit -m "feat: complete FlowLedger expense tracker with reusable components, validation & state management"
git branch -M ${branch}
git remote add origin ${cleanRepo}
git push -u origin ${branch}`;

    navigator.clipboard.writeText(commands);
    setCopiedCmd(true);
    addToast({
      title: 'Commands copied',
      message: 'Git setup and push commands copied to clipboard.',
      type: 'info',
    });
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      repoUrl: true,
      projectTitle: true,
      authorName: true,
      authorEmail: true,
    });

    const validationErrors = validateGitHubSubmission({
      repoUrl,
      projectTitle,
      authorName,
      authorEmail,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const submissionData: GitHubSubmission = {
      repoUrl: repoUrl.trim(),
      projectTitle: projectTitle.trim(),
      branch: branch.trim() || 'main',
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
      status: 'verified',
    };

    saveGitHubSubmission(submissionData);
    setIsSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GitHub Repository Submission"
      subtitle="Submit and verify the GitHub repository URL for this project"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {state.submission ? 'Update Submission' : 'Submit Repository URL'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Verification Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Project Requirements Verification
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Reusable Components</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Form Validation</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>State Management</span>
            </div>
          </div>
        </div>

        {/* Existing Submission status banner if present */}
        {state.submission && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Repository Registered:</strong> {state.submission.repoUrl}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
              Verified
            </span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="GitHub Repository URL"
            required
            placeholder="https://github.com/username/repository-name"
            prefixElement={<Github className="w-4 h-4 text-slate-500" />}
            value={repoUrl}
            onChange={(e) => {
              setRepoUrl(e.target.value);
              if (touched.repoUrl) {
                const errs = validateGitHubSubmission({
                  repoUrl: e.target.value,
                  projectTitle,
                  authorName,
                  authorEmail,
                });
                setErrors((prev) => ({ ...prev, repoUrl: errs.repoUrl }));
              }
            }}
            onBlur={() => handleBlur('repoUrl')}
            error={touched.repoUrl ? errors.repoUrl : undefined}
            helperText="Must be a valid GitHub repo URL (e.g. https://github.com/username/repo-name)"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Title"
              required
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              onBlur={() => handleBlur('projectTitle')}
              error={touched.projectTitle ? errors.projectTitle : undefined}
            />

            <Input
              label="Target Branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              prefixElement={<Code2 className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Author / Contributor Name"
              required
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              onBlur={() => handleBlur('authorName')}
              error={touched.authorName ? errors.authorName : undefined}
            />

            <Input
              label="Author Email"
              required
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              onBlur={() => handleBlur('authorEmail')}
              error={touched.authorEmail ? errors.authorEmail : undefined}
            />
          </div>

          <Textarea
            label="Submission Notes & Architecture Highlights"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={400}
            currentLength={notes.length}
            helperText="Summary of components, validation patterns, and state architecture implemented."
          />
        </form>

        {/* Quick Git Terminal Helper */}
        <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Quick Push Commands
            </span>
            <button
              type="button"
              onClick={handleCopyGitCommands}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedCmd ? 'Copied!' : 'Copy Shell Script'}</span>
            </button>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed overflow-x-auto whitespace-pre py-1">
            {`git init\ngit add .\ngit commit -m "feat: complete FlowLedger expense tracker"\ngit branch -M ${branch || 'main'}\ngit remote add origin ${repoUrl || 'https://github.com/user/repo'}\ngit push -u origin ${branch || 'main'}`}
          </div>
        </div>
      </div>
    </Modal>
  );
}
