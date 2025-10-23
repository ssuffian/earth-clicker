"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Globe, Mountain, Snowflake, Sun, Trees, X } from "lucide-react"
import { useEffect, useState } from "react"

interface Upgrade {
  id: string
  name: string
  cost: number
  pointsPerSecond: number
  owned: number
  icon: React.ReactNode
  description: string
}

export default function EarthClickerGame() {
  const [points, setPoints] = useState(0)
  const [clickPower, setClickPower] = useState(1)
  const [pointsPerSecond, setPointsPerSecond] = useState(0)
  const [clickAnimation, setClickAnimation] = useState(false)
  const [floatingGlobes, setFloatingGlobes] = useState<{ id: number; value: number; x: number; y: number; direction: number }[]>([])
  const [nextFloatingId, setNextFloatingId] = useState(0)
  const [showGlobeModal, setShowGlobeModal] = useState(false)
  const [geoJSONData, setGeoJSONData] = useState<any>(null)

  // Load GeoJSON data for continents and oceans
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        // Load individual continent files
        console.log('🌍 Loading GeoJSON files for all continents...')
        
        const [africaRes, antarcticaRes, asiaRes, europeRes, northAmericaRes, southAmericaRes, oceaniaRes] = await Promise.all([
          fetch('/geojson/africa.geojson'),
          fetch('/geojson/antarctica.geojson'),
          fetch('/geojson/asia.geojson'),
          fetch('/geojson/europe.geojson'),
          fetch('/geojson/north-america.geojson'),
          fetch('/geojson/south-america.geojson'),
          fetch('/geojson/oceania.geojson')
        ])
        
        const [africaData, antarcticaData, asiaData, europeData, northAmericaData, southAmericaData, oceaniaData] = await Promise.all([
          africaRes.json(),
          antarcticaRes.json(),
          asiaRes.json(),
          europeRes.json(),
          northAmericaRes.json(),
          southAmericaRes.json(),
          oceaniaRes.json()
        ])
        
        // The GeoJSON files are already proper Feature objects, just need to add our properties
        const addProperties = (feature: any, id: string, name: string, type: string) => ({
          ...feature,
          properties: { 
            ...feature.properties,
            name, 
            id, 
            type 
          }
        })
        
        // Create combined GeoJSON with proper IDs
        const combinedData = {
          type: "FeatureCollection",
          features: [
            // Continents
            addProperties(africaData, 'africa', 'Africa', 'continent'),
            addProperties(antarcticaData, 'antarctica', 'Antarctica', 'continent'),
            addProperties(asiaData, 'asia', 'Asia', 'continent'),
            addProperties(europeData, 'europe', 'Europe', 'continent'),
            addProperties(northAmericaData, 'north-america', 'North America', 'continent'),
            addProperties(southAmericaData, 'south-america', 'South America', 'continent'),
            addProperties(oceaniaData, 'australia', 'Australia', 'continent'),
          ]
        }
        
        setGeoJSONData(combinedData)
      } catch (error) {
        console.error('Error loading GeoJSON:', error)
      }
    }
    loadGeoJSON()
  }, [])

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    // Continents only - smallest to largest by area
    {
      id: "europe",
      name: "Europe",
      cost: 100,
      pointsPerSecond: 10,
      owned: 0,
      icon: <Trees className="h-5 w-5" />,
      description: "Smallest continent - rich history and culture",
    },
    {
      id: "antarctica",
      name: "Antarctica",
      cost: 200,
      pointsPerSecond: 45,
      owned: 0,
      icon: <Snowflake className="h-5 w-5" />,
      description: "Frozen continent - larger than Europe",
    },
    {
      id: "australia",
      name: "Australia",
      cost: 500,
      pointsPerSecond: 100,
      owned: 0,
      icon: <Sun className="h-5 w-5" />,
      description: "Island continent - unique wildlife",
    },
    {
      id: "south-america",
      name: "South America",
      cost: 10000,
      pointsPerSecond: 500,
      owned: 0,
      icon: <Trees className="h-5 w-5" />,
      description: "Amazon rainforest and Andes mountains",
    },
    {
      id: "north-america",
      name: "North America",
      cost: 100000,
      pointsPerSecond: 10000,
      owned: 0,
      icon: <Mountain className="h-5 w-5" />,
      description: "From Atlantic to Pacific coast",
    },
    {
      id: "africa",
      name: "Africa",
      cost: 1000000,
      pointsPerSecond: 50000,
      owned: 0,
      icon: <Sun className="h-5 w-5" />,
      description: "Second largest continent - cradle of humanity",
    },
    {
      id: "asia",
      name: "Asia",
      cost: 5000000,
      pointsPerSecond: 50000,
      owned: 0,
      icon: <Mountain className="h-5 w-5" />,
      description: "Largest continent - diverse landscapes",
    },
  ])

  // Auto-generate points
  useEffect(() => {
    const interval = setInterval(() => {
      if (pointsPerSecond > 0) {
        setPoints((prev) => prev + pointsPerSecond / 10)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [pointsPerSecond])

  // Calculate total points per second
  useEffect(() => {
    const total = upgrades.reduce((sum, upgrade) => {
      return sum + upgrade.pointsPerSecond * upgrade.owned
    }, 0)
    setPointsPerSecond(total)
  }, [upgrades])

  // Clean up floating globes
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingGlobes((prev) => prev.filter((globe) => Date.now() - globe.id < 1500))
    }, 100)

    return () => clearInterval(interval)
  }, [])

  const handleEarthClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setPoints((prev) => prev + clickPower)
    setClickAnimation(true)
    setTimeout(() => setClickAnimation(false), 100)

    // Create floating globe with random direction
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const direction = Math.random() * 360 // Random angle in degrees

    setFloatingGlobes((prev) => [...prev, { id: Date.now(), value: clickPower, x, y, direction }])
    setNextFloatingId((prev) => prev + 1)
  }

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId)
    if (upgrade && points >= upgrade.cost) {
      setPoints((p) => p - upgrade.cost)
      setUpgrades((prev) =>
        prev.map((u) => {
          if (u.id === upgradeId) {
            return {
              ...u,
              owned: u.owned + 1,
              cost: Math.floor(u.cost * 1.15),
            }
          }
          return u
        }),
      )
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return Math.floor(num).toLocaleString()
  }

  // Get purchased upgrades for map coloring
  const getPurchasedUpgrades = () => {
    return upgrades.filter(upgrade => upgrade.owned > 0).map(upgrade => upgrade.id)
  }

  // Create map filter based on purchased upgrades
  const getMapFilter = () => {
    const purchased = getPurchasedUpgrades()
    if (purchased.length === 0) return 'invert(1) brightness(0.8) contrast(1.2)'
    
    // Create a more colorful filter for purchased items
    return 'invert(0.2) brightness(1.2) contrast(1.5) saturate(1.5) hue-rotate(120deg)'
  }

  // Get region color based on ownership
  const getRegionColor = (regionId: string) => {
    const upgrade = upgrades.find(u => u.id === regionId)
    if (upgrade && upgrade.owned > 0) {
      return '#22c55e' // Green for owned regions
    }
    return '#dc2626' // Red for unowned regions (default)
  }

  // Convert GeoJSON coordinates to SVG path
  const geoJSONToSVGPath = (geometry: any, width: number, height: number) => {
    const paths: string[] = []
    
    // Handle both Polygon and MultiPolygon
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates
    
    if (Array.isArray(polygons)) {
      polygons.forEach((polygon: any, polygonIndex: number) => {
        // Handle the first ring of each polygon (exterior ring)
        if (Array.isArray(polygon) && polygon.length > 0) {
          const exteriorRing = polygon[0] // First ring is exterior
          
          if (Array.isArray(exteriorRing)) {
            const pathData = exteriorRing.map((coord: any, index: number) => {
              if (!Array.isArray(coord) || coord.length < 2) {
                return ''
              }
              
              const [lng, lat] = coord
              
              // Validate coordinates
              if (isNaN(lng) || isNaN(lat)) {
                return ''
              }
              
              // Convert longitude/latitude to SVG coordinates
              const x = ((lng + 180) / 360) * width
              const y = ((90 - lat) / 180) * height
              
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
            }).filter(segment => segment !== '').join(' ')
            
            if (pathData) {
              paths.push(`${pathData} Z`)
            }
          }
        }
      })
    }
    
    const result = paths.join(' ')
    return result
  }


  // Get region position on the map (fallback for simple positioning)
  const getRegionPosition = (regionId: string) => {
    const positions: Record<string, any> = {
      'europe': { top: '15%', left: '45%', width: '15%', height: '20%' },
      'antarctica': { top: '80%', left: '30%', width: '40%', height: '15%' },
      'australia': { top: '70%', left: '75%', width: '15%', height: '15%' },
      'south-america': { top: '40%', left: '25%', width: '12%', height: '35%' },
      'north-america': { top: '10%', left: '15%', width: '20%', height: '40%' },
      'africa': { top: '35%', left: '45%', width: '15%', height: '30%' },
      'asia': { top: '15%', left: '60%', width: '25%', height: '35%' }
    }
    return positions[regionId] || { top: '50%', left: '50%', width: '10%', height: '10%' }
  }

  // Get center position for continent ownership circles
  const getContinentCenter = (regionId: string) => {
    const centers: Record<string, { x: number; y: number }> = {
      'europe': { x: 430, y: 90 },         // Slightly left and a little higher
      'antarctica': { x: 400, y: 380 },    // Lower on the map
      'australia': { x: 700, y: 260 },    // A bit to the right
      'south-america': { x: 270, y: 230 }, // A little to the right
      'north-america': { x: 180, y: 100 },  // A little higher
      'africa': { x: 460, y: 200 },        // A tiny bit to the right
      'asia': { x: 580, y: 160 }           // Right side, upper
    }
    return centers[regionId] || { x: 400, y: 200 }
  }

  return (
    <div className="min-h-screen bg-black p-2 md:p-4">
      <div className="mx-auto max-w-6xl">
        {/* Points Tracker - Top Left */}
        <Card className="fixed left-2 top-2 z-10 w-60 bg-card p-3 text-center">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">Earth Points</p>
            <p className="text-3xl font-bold text-primary md:text-4xl">{formatNumber(points)}</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Per Click</p>
              <p className="font-semibold text-foreground">{clickPower}</p>
            </div>
            <div className="h-6 w-px bg-border" />
            <div>
              <p className="text-muted-foreground">Per Second</p>
              <p className="font-semibold text-secondary">{pointsPerSecond.toFixed(1)}</p>
            </div>
          </div>
        </Card>

        {/* Header */}
        <header className="mb-6 text-center">
          <h1 
            className="mb-2 text-3xl font-bold text-primary md:text-5xl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setPoints(prev => prev + 1000000)
              console.log('🎉 Secret discovered! +1,000,000 points!')
            }}
            title="Click for a secret!"
          >
            🌍 Earth Clicker
          </h1>
          <p className="text-base text-muted-foreground md:text-lg">Click the Earth to save the planet!</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          {/* Main Game Area */}
          <div className="flex flex-col items-center justify-center space-y-6">

            {/* Earth Button */}
            <div className="relative">
              <button
                onClick={handleEarthClick}
                className={`relative h-[400px] w-[400px] rounded-full text-[20rem] transition-all hover:scale-105 active:scale-95 md:h-[500px] md:w-[500px] ${
                  clickAnimation ? "animate-pulse-ring" : "animate-float"
                }`}
                aria-label="Click Earth"
              >
                <span className="absolute inset-0 flex items-center justify-center">🌍</span>

                {/* Floating globes */}
                {floatingGlobes.map((globe) => {
                  // Calculate random movement based on direction
                  const radians = (globe.direction * Math.PI) / 180
                  const distance = 120
                  const endX = Math.cos(radians) * distance
                  const endY = Math.sin(radians) * distance
                  
                  return (
                    <span
                      key={globe.id}
                      className="pointer-events-none absolute text-6xl"
                      style={{
                        left: globe.x,
                        top: globe.y,
                        animation: `float-globe 1.5s ease-out forwards`,
                        '--end-x': `${endX}px`,
                        '--end-y': `${endY}px`,
                      } as React.CSSProperties}
                    >
                      🌍
                    </span>
                  )
                })}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">Click the Earth to earn points!</p>
          </div>

          {/* Upgrades Sidebar */}
          <div className="space-y-4">
            <Card className="bg-card p-4 h-[calc(100vh-180px)] flex flex-col">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
                <Globe className="h-6 w-6 text-primary" />
                Earth & Oceans
              </h2>

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="space-y-2 pr-2">
                  {upgrades.map((upgrade) => {
                    const canAfford = points >= upgrade.cost

                    return (
                      <Card
                        key={upgrade.id}
                        className={`bg-muted p-3 transition-all ${
                          canAfford ? "border-primary/50 hover:border-primary" : "opacity-60"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-primary">{upgrade.icon}</div>
                            <div>
                              <h3 className="font-semibold text-foreground text-sm">{upgrade.name}</h3>
                              <p className="text-xs text-muted-foreground leading-tight">{upgrade.description}</p>
                            </div>
                          </div>
                          <div className="rounded-full bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
                            {upgrade.owned}
                          </div>
                        </div>

                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">+{upgrade.pointsPerSecond}/sec</span>
                          <span className="font-semibold text-accent">{formatNumber(upgrade.cost)} pts</span>
                        </div>

                        <Button
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className="w-full h-8 text-xs"
                          variant={canAfford ? "default" : "secondary"}
                        >
                          {canAfford ? "Buy" : `${formatNumber(upgrade.cost)} pts`}
                        </Button>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Globe Modal Button - Bottom Middle */}
      <Button
        onClick={() => setShowGlobeModal(true)}
        className="fixed bottom-4 left-1/2 z-10 h-12 w-12 -translate-x-1/2 rounded-full bg-primary p-0 shadow-lg hover:scale-105"
        aria-label="Open Globe View"
      >
        <Globe className="h-6 w-6" />
      </Button>

      {/* Globe Modal */}
      {showGlobeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative max-h-[90vh] w-[90vw] max-w-4xl rounded-lg bg-card p-6">
            {/* Close Button */}
            <Button
              onClick={() => setShowGlobeModal(false)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full p-0"
              variant="outline"
              aria-label="Close Globe View"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Modal Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-foreground">Interactive Globe</h2>
              <p className="text-muted-foreground">
                {getPurchasedUpgrades().length > 0 
                  ? `You own ${getPurchasedUpgrades().length} regions!` 
                  : "Click on countries to interact (coming soon)"
                }
              </p>
            </div>

            {/* World Map Container */}
            <div className="flex items-center justify-center">
              <div className="relative overflow-hidden rounded-lg border border-border bg-slate-900/50 map-container" style={{ height: '600px', width: '800px' }}>
                {/* Interactive Map with Region Coloring */}
                <div className="h-full w-full relative map-container" style={{ height: '600px', width: '800px' }}>
                  
                  {/* Overlay regions with individual coloring using GeoJSON */}
                  <div className="absolute inset-0 pointer-events-none" style={{ height: '600px', width: '800px' }}>
                    
                    {/* GeoJSON continent shapes */}
                    {geoJSONData && (
                      <svg
                        key={`map-${upgrades.map(u => `${u.id}-${u.owned}`).join('-')}`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 800 400"
                        preserveAspectRatio="xMidYMid meet"
                        style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '800px', 
                          height: '600px',
                          overflow: 'hidden'
                        }}
                      >
                        {geoJSONData.features.map((feature: any) => {
                          const upgrade = upgrades.find(u => u.id === feature.properties.id)
                          const regionColor = getRegionColor(feature.properties.id)
                          
                          // Convert GeoJSON to SVG path
                          const pathData = geoJSONToSVGPath(feature.geometry, 800, 400)
                          
                          return (
                            <g key={feature.properties.id}>
                              <path
                                d={pathData}
                                fill={regionColor}
                                fillOpacity={0.8}
                                stroke="rgba(255,255,255,0.8)"
                                strokeWidth="1"
                              />
                              {/* Ownership count circle */}
                              {upgrade && upgrade.owned > 0 && (
                                <g>
                                  <circle
                                    cx={getContinentCenter(feature.properties.id).x}
                                    cy={getContinentCenter(feature.properties.id).y}
                                    r="15"
                                    fill="rgba(0,0,0,0.9)"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                  <text
                                    x={getContinentCenter(feature.properties.id).x}
                                    y={getContinentCenter(feature.properties.id).y + 3}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="14"
                                    fontWeight="bold"
                                  >
                                    {upgrade.owned}
                                  </text>
                                </g>
                              )}
                            </g>
                          )
                        })}
                      </svg>
                    )}
                    
                    {/* Fallback rectangles if GeoJSON not loaded */}
                    {!geoJSONData && (
                      <div className="absolute inset-0">
                        {upgrades.map((upgrade) => {
                          return (
                            <div
                              key={upgrade.id}
                              className="absolute opacity-80 pointer-events-none"
                              style={{
                                backgroundColor: getRegionColor(upgrade.id),
                                // Position regions roughly on the map
                                ...getRegionPosition(upgrade.id)
                              }}
                            >
                              <div className="text-xs text-white font-bold p-1">
                                {upgrade.name}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Owned regions display */}
            {getPurchasedUpgrades().length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-semibold text-foreground text-center">Your Territories</h3>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {getPurchasedUpgrades().map(upgradeId => {
                    const upgrade = upgrades.find(u => u.id === upgradeId)
                    return upgrade ? (
                      <div key={upgradeId} className="flex items-center gap-2 bg-primary/10 rounded-lg p-2">
                        <div className="text-primary">{upgrade.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{upgrade.name}</p>
                          <p className="text-xs text-muted-foreground">Owned: {upgrade.owned}</p>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}

            {/* Future functionality note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {getPurchasedUpgrades().length > 0 
                  ? "More interactive features coming soon!"
                  : "Individual countries will be added here for interactive gameplay"
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float-globe {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(0.5);
          }
          100% {
            opacity: 0;
            transform: translate(var(--end-x, 0), var(--end-y, -120px)) scale(1.2);
          }
        }
        
        /* Prevent layout shifts in the map container */
        .map-container {
          contain: layout size;
          will-change: auto;
        }
        
        .map-container svg {
          contain: layout size;
          will-change: auto;
        }
      `}</style>
    </div>
  )
}
