"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import {
  type ICourse,
  type ICourseCount,
  type ICourseWithCount,
} from "@/interface";

import { type ApiResponse } from '@/interface'

interface CoursesContextType {
  courses: ICourseWithCount[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

export function CoursesProvider({ children }: { children: React.ReactNode }) {
  const [courses, setCourses] = useState<ICourseWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get<ApiResponse<ICourse[]>>("/api/course-list", {
        headers: { "Cache-Control": "no-cache" },
      });
      const countRes = await axios.get<ApiResponse<ICourseCount[]>>("/api/papers/count", {
        headers: { "Cache-Control": "no-cache" },
      });
      const countMap = new Map<string, number>(
        (countRes.data.data ?? []).map((c) => [c.name, c.count]),
      );

      const mergedCourses: ICourseWithCount[] = (res.data.data ?? []).map((course) => ({
        _id: course._id,
        name: course.name,
        count: countMap.get(course.name) ?? 0,
      }));

      setCourses(mergedCourses);
    } catch (err: unknown) {
      if (axios.isAxiosError<ApiResponse<never>>(err)) {
        setError(err.response?.data?.message ?? err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses();
  }, [fetchCourses]);

  const value = useMemo(
    () => ({ courses, loading, error, refetch: fetchCourses }),
    [courses, loading, error, fetchCourses],
  );

  return (
    <CoursesContext.Provider value={value}>
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CoursesContext);
  if (!context) {
    throw new Error("useCourses must be used within a CoursesProvider");
  }
  return context;
}
