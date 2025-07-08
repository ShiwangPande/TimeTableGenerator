"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function TimetableTestPage() {
  const [tests, setTests] = useState<Array<{
    name: string
    status: 'pending' | 'passing' | 'failing'
    message: string
    details?: any
  }>>([
    { name: "API Endpoints", status: 'pending', message: "Checking API endpoints..." },
    { name: "Database Connection", status: 'pending', message: "Checking database connection..." },
    { name: "Timetable Data", status: 'pending', message: "Checking timetable data..." },
    { name: "Filter Options", status: 'pending', message: "Checking filter options..." },
    { name: "Debug Timeslots", status: 'pending', message: "Checking timeslots directly..." },
  ])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setLoading(true)
    
    // Test 1: API Endpoints
    await testApiEndpoints()
    
    // Test 2: Database Connection
    await testDatabaseConnection()
    
    // Test 3: Timetable Data
    await testTimetableData()
    
    // Test 4: Filter Options
    await testFilterOptions()
    
    // Test 5: Debug Timeslots
    await testDebugTimeslots()
    
    setLoading(false)
  }

  const testApiEndpoints = async () => {
    const endpoints = [
      { name: "Timetable", url: "/api/timetable" },
      { name: "Classes", url: "/api/classes" },
      { name: "Teachers", url: "/api/teachers" },
      { name: "Rooms", url: "/api/rooms" },
      { name: "Time Slots", url: "/api/timeslots" },
      { name: "Subjects", url: "/api/subjects" },
    ]

    let allPassing = true
    const results = []

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url)
        if (response.ok) {
          results.push({ name: endpoint.name, status: 'passing' })
        } else {
          results.push({ name: endpoint.name, status: 'failing', error: response.statusText })
          allPassing = false
        }
      } catch (error) {
        results.push({ name: endpoint.name, status: 'failing', error: error.message })
        allPassing = false
      }
    }

    updateTest(0, allPassing ? 'passing' : 'failing', 
      allPassing ? 'All API endpoints are accessible' : 'Some API endpoints failed',
      results
    )
  }

  const testDatabaseConnection = async () => {
    try {
      const response = await fetch("/api/timetable")
      if (response.ok) {
        updateTest(1, 'passing', 'Database connection is working')
      } else {
        updateTest(1, 'failing', 'Database connection failed')
      }
    } catch (error) {
      updateTest(1, 'failing', 'Database connection error: ' + error.message)
    }
  }

  const testTimetableData = async () => {
    try {
      const response = await fetch("/api/timetable")
      if (response.ok) {
        const data = await response.json()
        updateTest(2, 'passing', `Found ${data.length} timetable entries`, data)
      } else {
        updateTest(2, 'failing', 'Failed to fetch timetable data')
      }
    } catch (error) {
      updateTest(2, 'failing', 'Timetable data error: ' + error.message)
    }
  }

  const testFilterOptions = async () => {
    try {
      const [classesRes, teachersRes, timeslotsRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/teachers"),
        fetch("/api/timeslots")
      ])

      if (classesRes.ok && teachersRes.ok && timeslotsRes.ok) {
        const classes = await classesRes.json()
        const teachers = await teachersRes.json()
        const timeslots = await timeslotsRes.json()
        updateTest(3, 'passing', `Found ${classes.length} classes, ${teachers.length} teachers, and ${timeslots.length} timeslots`, {
          classes: classes.length,
          teachers: teachers.length,
          timeslots: timeslots.length,
          timeslotsData: timeslots
        })
      } else {
        const errors = []
        if (!classesRes.ok) errors.push(`Classes: ${classesRes.status}`)
        if (!teachersRes.ok) errors.push(`Teachers: ${teachersRes.status}`)
        if (!timeslotsRes.ok) errors.push(`Timeslots: ${timeslotsRes.status}`)
        updateTest(3, 'failing', `Failed to fetch filter options: ${errors.join(', ')}`)
      }
    } catch (error) {
      updateTest(3, 'failing', 'Filter options error: ' + error.message)
    }
  }

  const testDebugTimeslots = async () => {
    try {
      const response = await fetch("/api/debug/timeslots")
      if (response.ok) {
        const data = await response.json()
        updateTest(4, 'passing', `Found ${data.count} timeslots in database`, data)
      } else {
        const error = await response.json()
        updateTest(4, 'failing', `Debug timeslots failed: ${error.error}`, error)
      }
    } catch (error) {
      updateTest(4, 'failing', 'Debug timeslots error: ' + error.message)
    }
  }

  const updateTest = (index: number, status: 'pending' | 'passing' | 'failing', message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passing':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failing':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passing':
        return 'bg-green-50 border-green-200'
      case 'failing':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const passingTests = tests.filter(t => t.status === 'passing').length
  const totalTests = tests.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Timetable Management Test
          </h1>
          <p className="text-gray-600">
            Testing the timetable management functionality and dependencies
          </p>
        </div>

        {/* Test Results Summary */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Test Results
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              {passingTests} of {totalTests} tests passing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant={passingTests === totalTests ? "default" : "secondary"}>
                {passingTests}/{totalTests} Passing
              </Badge>
              <Button 
                variant="outline" 
                onClick={runTests}
                disabled={loading}
                size="sm"
              >
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Running...' : 'Run Tests'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Individual Test Results */}
        <div className="space-y-4">
          {tests.map((test, index) => (
            <Card key={index} className={`bg-white/80 backdrop-blur-sm ${getStatusColor(test.status)}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                  </div>
                  <Badge variant={test.status === 'passing' ? 'default' : test.status === 'failing' ? 'destructive' : 'secondary'}>
                    {test.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{test.message}</p>
                {test.details && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
                    <pre className="text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recommendations */}
        {!loading && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {passingTests === totalTests ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All tests are passing! The timetable management system is working correctly.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some tests are failing. Please check the database connection and ensure all required data is available.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>• Make sure the database is running and accessible</p>
                <p>• Ensure you have created classes, teachers, rooms, and time slots</p>
                <p>• Generate a timetable if no entries are found</p>
                <p>• Check the browser console for any JavaScript errors</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 