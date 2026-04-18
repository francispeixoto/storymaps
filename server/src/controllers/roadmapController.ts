import { Request, Response } from 'express';
import { getRoadmap } from '../services/roadmapService';

export const getRoadmapItems = (req: Request, res: Response): void => {
  const { contextId, minPriority, status } = req.query;
  
  const roadmap = getRoadmap(contextId ? Number(contextId) : undefined);
  
  // Filter by minimum priority if specified
  let filtered = roadmap;
  if (minPriority) {
    const priorityOrder: Record<string, number> = { 'Need': 3, 'Want': 2, 'Nice': 1 };
    const minPriorityValue = priorityOrder[minPriority as string] || 0;
    filtered = filterByPriority(filtered, minPriorityValue);
  }

  // Filter by status if specified
  if (status && status !== 'all') {
    filtered = filterByStatus(filtered, status as string);
  }

  res.json({ roadmap: filtered });
};

function filterByPriority(items: any[], minPriorityValue: number): any[] {
  const priorityOrder: Record<string, number> = { 'Need': 3, 'Want': 2, 'Nice': 1 };
  
  return items.filter(item => {
    if (priorityOrder[item.priority] >= minPriorityValue) {
      if (item.children) {
        item.children = filterByPriority(item.children, minPriorityValue);
      }
      return true;
    }
    return false;
  }).map(item => ({
    ...item,
    children: item.children ? filterByPriority(item.children, minPriorityValue) : []
  }));
}

function filterByStatus(items: any[], status: string): any[] {
  return items.filter(item => {
    if (item.dependencyBlockers?.length > 0) {
      const hasBlocked = item.dependencyBlockers.some((b: any) => b.status === 'blocked');
      const hasWarning = item.dependencyBlockers.some((b: any) => b.status === 'warning');
      
      if (status === 'blocked' && !hasBlocked) return false;
      if (status === 'warning' && !hasWarning) return false;
      if (status === 'ready' && (hasBlocked || hasWarning)) return false;
    }
    return true;
  }).map(item => ({
    ...item,
    children: item.children ? filterByStatus(item.children, status) : []
  }));
}