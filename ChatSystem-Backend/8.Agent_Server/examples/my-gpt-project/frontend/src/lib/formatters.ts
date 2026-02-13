/**
 * 搜索结果解析器
 * 将爬虫抓取的带行号原始内容转换为结构化数据
 */

export type SearchSource = {
  url: string;
  title: string;
  content: string;
  favicon?: string;
  hostname?: string;
};

/**
 * 从 URL 中提取主机名
 */
function extractHostname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
}

/**
 * 获取网站的 favicon URL
 */
function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * 解析带行号的爬虫数据 (L0, L1, L2... 格式)
 */
export function parseLineNumberedContent(rawData: string): SearchSource[] {
  const sources: SearchSource[] = [];
  
  // 尝试匹配 L0: URL 格式
  const urlPattern = /L\d+:\s*(https?:\/\/[^\s\n]+)/gi;
  const urls = [...rawData.matchAll(urlPattern)].map(m => m[1]);
  
  if (urls.length === 0) {
    // 尝试直接匹配 URL
    const directUrlPattern = /(https?:\/\/[^\s\n]+)/gi;
    const directUrls = [...rawData.matchAll(directUrlPattern)];
    for (const match of directUrls) {
      const url = match[1];
      sources.push({
        url,
        title: extractHostname(url),
        content: '',
        favicon: getFaviconUrl(url),
        hostname: extractHostname(url),
      });
    }
  } else {
    for (const url of urls) {
      sources.push({
        url,
        title: extractHostname(url),
        content: '',
        favicon: getFaviconUrl(url),
        hostname: extractHostname(url),
      });
    }
  }

  return sources;
}

/**
 * 解析 JSON 格式的搜索结果
 */
export function parseJsonSearchResults(data: unknown): SearchSource[] {
  if (!data) return [];
  
  // 处理数组格式
  if (Array.isArray(data)) {
    return data.map((item) => ({
      url: item.url || item.link || '',
      title: item.title || item.name || extractHostname(item.url || ''),
      content: item.content || item.snippet || item.description || '',
      favicon: getFaviconUrl(item.url || item.link || ''),
      hostname: extractHostname(item.url || item.link || ''),
    })).filter(s => s.url);
  }
  
  // 处理单个对象
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.url || obj.link) {
      return [{
        url: (obj.url || obj.link) as string,
        title: (obj.title || obj.name || extractHostname((obj.url || obj.link) as string)) as string,
        content: (obj.content || obj.snippet || obj.description || '') as string,
        favicon: getFaviconUrl((obj.url || obj.link) as string),
        hostname: extractHostname((obj.url || obj.link) as string),
      }];
    }
    
    // 处理 results 字段
    if (obj.results && Array.isArray(obj.results)) {
      return parseJsonSearchResults(obj.results);
    }
  }
  
  return [];
}

/**
 * 智能解析搜索结果 - 自动检测格式
 */
export function formatSearchData(rawData: string | object): SearchSource[] {
  if (typeof rawData === 'string') {
    // 尝试解析为 JSON
    try {
      const parsed = JSON.parse(rawData);
      const results = parseJsonSearchResults(parsed);
      if (results.length > 0) return results;
    } catch {
      // 不是 JSON，尝试解析行号格式
    }
    
    // 解析行号格式
    return parseLineNumberedContent(rawData);
  }
  
  return parseJsonSearchResults(rawData);
}

/**
 * 检测内容类型
 */
export type ContentType = 'python' | 'javascript' | 'json' | 'search' | 'text' | 'markdown';

export function detectContentType(toolName: string, content: string): ContentType {
  const lowerName = toolName.toLowerCase();
  
  if (lowerName.includes('python') || lowerName.includes('execute_python')) {
    return 'python';
  }
  
  if (lowerName.includes('search') || lowerName.includes('browse') || lowerName.includes('web')) {
    return 'search';
  }
  
  // 检测 JSON
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // 不是有效 JSON
    }
  }
  
  // 检测代码特征
  if (content.includes('def ') || content.includes('import ') || content.includes('class ')) {
    return 'python';
  }
  
  if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
    return 'javascript';
  }
  
  return 'text';
}

/**
 * 从函数调用参数中提取代码
 */
export function extractCodeFromArgs(args: string): { code: string; language: string } | null {
  try {
    const parsed = JSON.parse(args);
    
    // 常见的代码字段名
    const codeFields = ['code', 'script', 'source', 'python_code', 'js_code'];
    
    for (const field of codeFields) {
      if (parsed[field]) {
        return {
          code: parsed[field],
          language: field.includes('python') ? 'python' : 'javascript',
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * 从函数调用参数中提取搜索查询
 */
export function extractSearchQuery(args: string): string | null {
  try {
    const parsed = JSON.parse(args);
    return parsed.query || parsed.search || parsed.q || parsed.keyword || null;
  } catch {
    return null;
  }
}
