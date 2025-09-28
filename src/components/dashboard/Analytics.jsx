import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ChartBarIcon, TruckIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const Analytics = () => {
  const [metrics, setMetrics] = useState({
    wasteCollected: 0,
    wasteComposted: 0,
    compostProduced: 0,
    co2Reduction: 0,
    landfillDiversion: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      // Fetch waste collection data
      const { data: collectionData } = await supabase
        .from('collection_logs')
        .select('weight_kg, waste_type')
        .gte('collection_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Fetch compost operations data
      const { data: compostData } = await supabase
        .from('compost_operations')
        .select('input_weight_kg, output_weight_kg')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      // Calculate metrics
      const totalWasteCollected = collectionData?.reduce((sum, item) => sum + (item.weight_kg || 0), 0) || 0
      const biodegradableWaste = collectionData?.filter(item => item.waste_type === 'biodegradable')
        .reduce((sum, item) => sum + (item.weight_kg || 0), 0) || 0
      const totalCompostProduced = compostData?.reduce((sum, item) => sum + (item.output_weight_kg || 0), 0) || 0
      
      // Calculate CO2 reduction (rough estimate: 1kg compost = 0.5kg CO2 reduction)
      const co2Reduction = totalCompostProduced * 0.5
      
      // Calculate landfill diversion percentage
      const landfillDiversion = totalWasteCollected > 0 ? (biodegradableWaste / totalWasteCollected) * 100 : 0

      setMetrics({
        wasteCollected: Math.round(totalWasteCollected),
        wasteComposted: Math.round(biodegradableWaste),
        compostProduced: Math.round(totalCompostProduced),
        co2Reduction: Math.round(co2Reduction),
        landfillDiversion: Math.round(landfillDiversion)
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const metricCards = [
    {
      name: 'Waste Collected (kg)',
      value: metrics.wasteCollected,
      icon: TruckIcon,
      color: 'bg-blue-500',
      description: 'Total waste collected in the last 30 days'
    },
    {
      name: 'Waste Composted (kg)',
      value: metrics.wasteComposted,
      icon: SparklesIcon,
      color: 'bg-green-500',
      description: 'Biodegradable waste processed'
    },
    {
      name: 'Compost Produced (kg)',
      value: metrics.compostProduced,
      icon: ArrowPathIcon,
      color: 'bg-purple-500',
      description: 'High-quality compost generated'
    },
    {
      name: 'CO₂ Reduction (kg)',
      value: metrics.co2Reduction,
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      description: 'Estimated CO₂ emissions avoided'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sustainability Analytics</h2>
        <p className="text-gray-600">Track environmental impact and operational efficiency</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <div key={metric.name} className="card">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${metric.color}`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{metric.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Landfill Diversion */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Landfill Diversion Rate</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Diversion Rate</span>
              <span>{metrics.landfillDiversion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(metrics.landfillDiversion, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {metrics.landfillDiversion}% of collected waste is diverted from landfills
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Environmental Impact</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trees Equivalent</span>
              <span className="text-lg font-semibold text-green-600">
                {Math.round(metrics.co2Reduction / 22)} trees
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Car Miles Offset</span>
              <span className="text-lg font-semibold text-blue-600">
                {Math.round(metrics.co2Reduction * 2.2)} miles
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Energy Saved (kWh)</span>
              <span className="text-lg font-semibold text-purple-600">
                {Math.round(metrics.co2Reduction * 0.5)} kWh
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Operational Efficiency</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Composting Rate</span>
              <span className="text-lg font-semibold text-green-600">
                {metrics.wasteComposted > 0 ? Math.round((metrics.compostProduced / metrics.wasteComposted) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing Efficiency</span>
              <span className="text-lg font-semibold text-blue-600">
                {metrics.wasteCollected > 0 ? Math.round((metrics.wasteComposted / metrics.wasteCollected) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Quality Score</span>
              <span className="text-lg font-semibold text-purple-600">
                {metrics.compostProduced > 0 ? Math.round((metrics.compostProduced / metrics.wasteComposted) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {metrics.landfillDiversion < 50 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Improve Waste Segregation</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Current diversion rate is {metrics.landfillDiversion}%. Focus on better waste segregation to increase biodegradable waste collection.
              </p>
            </div>
          )}
          
          {metrics.compostProduced < metrics.wasteComposted * 0.7 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800">Optimize Composting Process</h4>
              <p className="text-sm text-blue-700 mt-1">
                Composting efficiency can be improved. Review temperature, humidity, and processing time.
              </p>
            </div>
          )}
          
          {metrics.co2Reduction > 100 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800">Excellent Performance!</h4>
              <p className="text-sm text-green-700 mt-1">
                You've achieved significant CO₂ reduction. Consider expanding operations to maximize impact.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
