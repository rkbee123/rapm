import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const parseFile = async (file: File): Promise<ParsedData> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (fileExtension === 'csv') {
    return parseCSV(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file);
  } else if (fileExtension === 'json') {
    return parseJSON(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV, Excel, or JSON files.');
  }
};

const parseCSV = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }
        
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];
        
        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
};

const parseExcel = async (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).map((row: any[]) => {
          const obj: Record<string, any> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        
        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      } catch (error) {
        reject(new Error(`Excel parsing error: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

const parseJSON = (file: File): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (!Array.isArray(jsonData)) {
          reject(new Error('JSON file must contain an array of objects'));
          return;
        }
        
        if (jsonData.length === 0) {
          reject(new Error('JSON file is empty'));
          return;
        }
        
        const headers = Object.keys(jsonData[0]);
        
        resolve({
          headers,
          rows: jsonData,
          totalRows: jsonData.length,
        });
      } catch (error) {
        reject(new Error(`JSON parsing error: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read JSON file'));
    };
    
    reader.readAsText(file);
  });
};

export const validateFileData = (
  data: ParsedData,
  campaignType: string
): FileValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if file has data
  if (data.totalRows === 0) {
    errors.push('File contains no data rows');
    return { isValid: false, errors, warnings };
  }
  
  // Validate based on campaign type
  switch (campaignType) {
    case 'linkedin':
      validateLinkedInData(data, errors, warnings);
      break;
    case 'email':
      validateEmailData(data, errors, warnings);
      break;
    case 'webinar':
      validateWebinarData(data, errors, warnings);
      break;
    default:
      // Generic validation for other campaign types
      if (data.headers.length === 0) {
        errors.push('File must have column headers');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

const validateLinkedInData = (
  data: ParsedData,
  errors: string[],
  warnings: string[]
) => {
  const requiredFields = ['name', 'company'];
  const recommendedFields = ['title', 'date_sent', 'status'];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check recommended fields
  recommendedFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  });
};

const validateEmailData = (
  data: ParsedData,
  errors: string[],
  warnings: string[]
) => {
  const requiredFields = ['name', 'email'];
  const recommendedFields = ['company', 'campaign_name', 'date_sent'];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check recommended fields
  recommendedFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  });
  
  // Validate email format for a sample of rows
  const emailHeader = data.headers.find(h => h.toLowerCase().includes('email'));
  if (emailHeader) {
    const sampleSize = Math.min(10, data.rows.length);
    const invalidEmails = data.rows.slice(0, sampleSize).filter(row => {
      const email = row[emailHeader];
      return email && !isValidEmail(email);
    });
    
    if (invalidEmails.length > 0) {
      warnings.push(`Some email addresses appear to be invalid`);
    }
  }
};

const validateWebinarData = (
  data: ParsedData,
  errors: string[],
  warnings: string[]
) => {
  const requiredFields = ['name', 'email'];
  const recommendedFields = ['company', 'industry', 'invited_date'];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Check recommended fields
  recommendedFields.forEach(field => {
    if (!data.headers.some(h => h.toLowerCase().includes(field))) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  });
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateTags = (data: ParsedData, campaignType: string): string[] => {
  const tags: Set<string> = new Set();
  
  // Add campaign type tag
  tags.add(campaignType);
  
  // Add size-based tags
  if (data.totalRows > 1000) {
    tags.add('Large Dataset');
  } else if (data.totalRows > 100) {
    tags.add('Medium Dataset');
  } else {
    tags.add('Small Dataset');
  }
  
  // Try to extract industry/company tags from data
  const companyHeader = data.headers.find(h => 
    h.toLowerCase().includes('company') || h.toLowerCase().includes('organization')
  );
  
  if (companyHeader) {
    const companies = data.rows.slice(0, 20).map(row => row[companyHeader]).filter(Boolean);
    const industries = extractIndustries(companies);
    industries.forEach(industry => tags.add(industry));
  }
  
  return Array.from(tags);
};

const extractIndustries = (companies: string[]): string[] => {
  const industries: Set<string> = new Set();
  const industryKeywords = {
    'SaaS': ['saas', 'software', 'tech', 'app', 'platform'],
    'FinTech': ['fintech', 'finance', 'bank', 'payment', 'crypto'],
    'Healthcare': ['health', 'medical', 'pharma', 'bio', 'clinic'],
    'E-commerce': ['ecommerce', 'retail', 'shop', 'marketplace', 'commerce'],
    'Education': ['education', 'school', 'university', 'learning', 'academy'],
  };
  
  companies.forEach(company => {
    const companyLower = company.toLowerCase();
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some(keyword => companyLower.includes(keyword))) {
        industries.add(industry);
      }
    });
  });
  
  return Array.from(industries);
};