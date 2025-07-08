"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Filter, X, RotateCcw, Search } from "lucide-react"
import { ClassLevel } from "@prisma/client"

interface FilterState {
  class: string
  teacher: string
  curriculum: string
  section: string
}

interface FilterOptions {
  sections: string[]
  curriculumLevels: ClassLevel[]
  classes: Array<{ id: string; name: string; section: string }>
  teachers: Array<{ id: string; user: { name: string } }>
}

interface TimetableFiltersProps {
  filters?: FilterState
  onFiltersChange?: (filters: FilterState) => void
}

export function TimetableFilters({ filters: externalFilters, onFiltersChange }: TimetableFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    class: "all",
    teacher: "all",
    curriculum: "all",
    section: "all",
  })
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sections: [],
    curriculumLevels: [],
    classes: [],
    teachers: [],
  })
  
  const [loading, setLoading] = useState(false)
  const [showActiveFilters, setShowActiveFilters] = useState(false)

  // Sync with external filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(externalFilters)
    }
  }, [externalFilters])

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [classesRes, teachersRes, distinctRes] = await Promise.all([
          fetch("/api/classes"),
          fetch("/api/teachers"),
          fetch("/api/classes?distinct=true")
        ])

        if (classesRes.ok) {
          const classesData = await classesRes.json()
          setFilterOptions(prev => ({ ...prev, classes: classesData }))
        }

        if (teachersRes.ok) {
          const teachersData = await teachersRes.json()
          setFilterOptions(prev => ({ ...prev, teachers: teachersData }))
        }

        if (distinctRes.ok) {
          const distinctData = await distinctRes.json()
          setFilterOptions(prev => ({
            ...prev,
            sections: distinctData.sections || [],
            curriculumLevels: distinctData.curriculumLevels || [],
          }))
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error)
      }
    }

    fetchFilterOptions()
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value,
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const applyFilters = async () => {
    setLoading(true)
    try {
      // The parent component will handle the actual filtering
      setShowActiveFilters(true)
    } catch (error) {
      console.error("Failed to apply filters:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    const resetFilters = {
      class: "all",
      teacher: "all",
      curriculum: "all",
      section: "all",
    }
    setFilters(resetFilters)
    onFiltersChange?.(resetFilters)
    setShowActiveFilters(false)
  }

  const removeFilter = (key: keyof FilterState) => {
    const newFilters = {
      ...filters,
      [key]: "all"
    }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // Curriculum display mapping
  const getCurriculumDisplayName = (level: ClassLevel) => {
    switch (level) {
      case "IB_MYP":
        return "IB MYP"
      case "IB_DP":
        return "IB DP"
      case "Gen":
        return "General"
      default:
        return level
    }
  }

  const hasActiveFilters = Object.values(filters).some(filter => filter !== "all")

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-3 w-3" />
              Class
            </Label>
            <Select value={filters.class} onValueChange={(value) => handleFilterChange("class", value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {filterOptions.classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-3 w-3" />
              Teacher
            </Label>
            <Select value={filters.teacher} onValueChange={(value) => handleFilterChange("teacher", value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {filterOptions.teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-3 w-3" />
              Curriculum
            </Label>
            <Select value={filters.curriculum} onValueChange={(value) => handleFilterChange("curriculum", value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Curriculums" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Curriculums</SelectItem>
                {filterOptions.curriculumLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {getCurriculumDisplayName(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Search className="h-3 w-3" />
              Section
            </Label>
            <Select value={filters.section} onValueChange={(value) => handleFilterChange("section", value)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {filterOptions.sections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="gap-2 text-xs h-8"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
          {hasActiveFilters && (
            <Button
              variant="default"
              size="sm"
              onClick={applyFilters}
              disabled={loading}
              className="gap-2 text-xs h-8"
            >
              <Filter className="h-3 w-3" />
              {loading ? "Applying..." : "Apply"}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {showActiveFilters && hasActiveFilters && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.class !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Class: {filterOptions.classes.find(c => c.id === filters.class)?.name || filters.class}
                <button
                  onClick={() => removeFilter("class")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.teacher !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Teacher: {filterOptions.teachers.find(t => t.id === filters.teacher)?.user.name || filters.teacher}
                <button
                  onClick={() => removeFilter("teacher")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.curriculum !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Curriculum: {getCurriculumDisplayName(filters.curriculum as ClassLevel)}
                <button
                  onClick={() => removeFilter("curriculum")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.section !== "all" && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Section: {filters.section}
                <button
                  onClick={() => removeFilter("section")}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
