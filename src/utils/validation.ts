import { FormErrors, TransactionFormData } from '../types';

export function validateTransactionForm(data: TransactionFormData): FormErrors {
  const errors: FormErrors = {};

  // Title validation
  const trimmedTitle = data.title.trim();
  if (!trimmedTitle) {
    errors.title = 'Title or description is required';
  } else if (trimmedTitle.length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (trimmedTitle.length > 60) {
    errors.title = 'Title cannot exceed 60 characters';
  }

  // Amount validation
  const amountStr = data.amount.trim();
  if (!amountStr) {
    errors.amount = 'Amount is required';
  } else {
    const num = Number(amountStr);
    if (isNaN(num)) {
      errors.amount = 'Please enter a valid numeric amount';
    } else if (num <= 0) {
      errors.amount = 'Amount must be greater than zero';
    } else if (num > 1000000) {
      errors.amount = 'Amount cannot exceed 1,000,000';
    } else {
      // Check decimal places
      const parts = amountStr.split('.');
      if (parts[1] && parts[1].length > 2) {
        errors.amount = 'Maximum 2 decimal places allowed';
      }
    }
  }

  // Category validation
  if (!data.category) {
    errors.category = 'Please select a category';
  }

  // Type validation
  if (data.type !== 'expense' && data.type !== 'income') {
    errors.type = 'Please select either Expense or Income';
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.date = 'Date must be formatted as YYYY-MM-DD';
    } else {
      const year = parseInt(data.date.substring(0, 4), 10);
      if (year < 2000 || year > 2040) {
        errors.date = 'Please select a date between 2000 and 2040';
      }
    }
  }

  // Payment method validation
  if (!data.paymentMethod) {
    errors.paymentMethod = 'Please select a payment method';
  }

  // Tags validation
  if (data.tagsInput && data.tagsInput.trim()) {
    const rawTags = data.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (rawTags.length > 5) {
      errors.tagsInput = 'Maximum 5 tags allowed';
    } else {
      for (const tag of rawTags) {
        if (tag.length > 20) {
          errors.tagsInput = `Tag "${tag}" is too long (max 20 chars)`;
          break;
        }
        if (!/^[a-zA-Z0-9\-_ ]+$/.test(tag)) {
          errors.tagsInput = `Tag "${tag}" contains invalid characters (letters, numbers, spaces only)`;
          break;
        }
      }
    }
  }

  // Notes validation
  if (data.notes && data.notes.length > 300) {
    errors.notes = 'Notes cannot exceed 300 characters';
  }

  return errors;
}

export function validateSingleField(
  fieldName: keyof TransactionFormData,
  value: string,
  formData: TransactionFormData
): string | undefined {
  const updatedData = { ...formData, [fieldName]: value };
  const errors = validateTransactionForm(updatedData);
  return errors[fieldName as keyof FormErrors];
}

export interface GitHubSubmissionErrors {
  repoUrl?: string;
  projectTitle?: string;
  authorName?: string;
  authorEmail?: string;
}

export function validateGitHubSubmission(values: {
  repoUrl: string;
  projectTitle: string;
  authorName: string;
  authorEmail: string;
}): GitHubSubmissionErrors {
  const errors: GitHubSubmissionErrors = {};

  const trimmedRepo = values.repoUrl.trim();
  if (!trimmedRepo) {
    errors.repoUrl = 'GitHub repository URL is required';
  } else {
    // Regex for GitHub repo: https://github.com/username/reponame or github.com/username/reponame
    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+(\/)?$/;
    if (!githubRegex.test(trimmedRepo)) {
      errors.repoUrl = 'Enter a valid GitHub URL (e.g. https://github.com/username/repo-name)';
    }
  }

  if (!values.projectTitle.trim()) {
    errors.projectTitle = 'Project title is required';
  }

  if (!values.authorName.trim()) {
    errors.authorName = 'Author or contributor name is required';
  }

  if (!values.authorEmail.trim()) {
    errors.authorEmail = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.authorEmail.trim())) {
    errors.authorEmail = 'Please enter a valid email address';
  }

  return errors;
}
