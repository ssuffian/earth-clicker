"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Droplets, Fish, Globe, Mountain, Snowflake, Sun, Trees, Waves, X } from "lucide-react"
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

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "africa",
      name: "Africa",
      cost: 15,
      pointsPerSecond: 0.1,
      owned: 0,
      icon: <Sun className="h-5 w-5" />,
      description: "The cradle of humanity",
    },
    {
      id: "asia",
      name: "Asia",
      cost: 100,
      pointsPerSecond: 1,
      owned: 0,
      icon: <Mountain className="h-5 w-5" />,
      description: "Largest continent with diverse landscapes",
    },
    {
      id: "europe",
      name: "Europe",
      cost: 500,
      pointsPerSecond: 8,
      owned: 0,
      icon: <Trees className="h-5 w-5" />,
      description: "Rich history and culture",
    },
    {
      id: "north-america",
      name: "North America",
      cost: 3000,
      pointsPerSecond: 47,
      owned: 0,
      icon: <Waves className="h-5 w-5" />,
      description: "From Atlantic to Pacific",
    },
    {
      id: "south-america",
      name: "South America",
      cost: 15000,
      pointsPerSecond: 200,
      owned: 0,
      icon: <Trees className="h-5 w-5" />,
      description: "Amazon rainforest and Andes",
    },
    {
      id: "antarctica",
      name: "Antarctica",
      cost: 75000,
      pointsPerSecond: 1000,
      owned: 0,
      icon: <Snowflake className="h-5 w-5" />,
      description: "The frozen continent",
    },
    {
      id: "pacific",
      name: "Pacific Ocean",
      cost: 200000,
      pointsPerSecond: 3000,
      owned: 0,
      icon: <Waves className="h-5 w-5" />,
      description: "Largest ocean on Earth",
    },
    {
      id: "atlantic",
      name: "Atlantic Ocean",
      cost: 500000,
      pointsPerSecond: 8000,
      owned: 0,
      icon: <Droplets className="h-5 w-5" />,
      description: "Connects the Americas to Europe and Africa",
    },
    {
      id: "indian",
      name: "Indian Ocean",
      cost: 1200000,
      pointsPerSecond: 20000,
      owned: 0,
      icon: <Fish className="h-5 w-5" />,
      description: "Warm waters and diverse marine life",
    },
    {
      id: "southern",
      name: "Southern Ocean",
      cost: 3000000,
      pointsPerSecond: 50000,
      owned: 0,
      icon: <Snowflake className="h-5 w-5" />,
      description: "The Antarctic waters",
    },
    {
      id: "arctic",
      name: "Arctic Ocean",
      cost: 8000000,
      pointsPerSecond: 120000,
      owned: 0,
      icon: <Snowflake className="h-5 w-5" />,
      description: "The frozen northern waters",
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
    setUpgrades((prev) =>
      prev.map((upgrade) => {
        if (upgrade.id === upgradeId && points >= upgrade.cost) {
          setPoints((p) => p - upgrade.cost)
          return {
            ...upgrade,
            owned: upgrade.owned + 1,
            cost: Math.floor(upgrade.cost * 1.15),
          }
        }
        return upgrade
      }),
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`
    return Math.floor(num).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Points Tracker - Top Left */}
        <Card className="fixed left-4 top-4 z-10 w-64 bg-card p-4 text-center">
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
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary md:text-6xl">🌍 Earth Clicker</h1>
          <p className="text-lg text-muted-foreground md:text-xl">Click the Earth to save the planet!</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Game Area */}
          <div className="flex flex-col items-center justify-center space-y-6">

            {/* Earth Button */}
            <div className="relative">
              <button
                onClick={handleEarthClick}
                className={`relative h-80 w-80 rounded-full text-9xl transition-all hover:scale-105 active:scale-95 md:h-96 md:w-96 ${
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
                      className="pointer-events-none absolute text-2xl"
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
            <Card className="bg-card p-4">
              <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-foreground">
                <Globe className="h-6 w-6 text-primary" />
                Earth & Oceans
              </h2>

              <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="space-y-3 pr-2">
                  {upgrades.map((upgrade) => {
                    const canAfford = points >= upgrade.cost

                    return (
                      <Card
                        key={upgrade.id}
                        className={`bg-muted p-4 transition-all ${
                          canAfford ? "border-primary/50 hover:border-primary" : "opacity-60"
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-primary">{upgrade.icon}</div>
                            <div>
                              <h3 className="font-semibold text-foreground">{upgrade.name}</h3>
                              <p className="text-xs text-muted-foreground">{upgrade.description}</p>
                            </div>
                          </div>
                          <div className="rounded-full bg-primary/20 px-2 py-1 text-xs font-bold text-primary">
                            {upgrade.owned}
                          </div>
                        </div>

                        <div className="mb-3 flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">+{upgrade.pointsPerSecond}/sec</span>
                          <span className="font-semibold text-accent">{formatNumber(upgrade.cost)} points</span>
                        </div>

                        <Button
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAfford}
                          className="w-full"
                          variant={canAfford ? "default" : "secondary"}
                        >
                          {canAfford ? "Explore" : "Not enough points"}
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
              <p className="text-muted-foreground">Click on countries to interact (coming soon)</p>
            </div>

            {/* World Map Container */}
            <div className="flex items-center justify-center">
              <div className="relative h-[600px] w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-muted/20">
                {/* Real World Map SVG */}
                <div className="h-full w-full">
                  <img
                    src="/images/world-map.svg"
                    alt="World Map"
                    className="h-full w-full object-contain"
                    style={{ 
                      filter: 'invert(1) brightness(0.8) contrast(1.2)',
                      mixBlendMode: 'screen'
                    }}
                    onError={(e) => {
                      console.error('Failed to load world map:', e);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                
                {/* Placeholder for future country functionality */}
                <div className="absolute inset-0 pointer-events-none"></div>
              </div>
            </div>

            {/* Future functionality note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Individual countries will be added here for interactive gameplay
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
      `}</style>
    </div>
  )
}
