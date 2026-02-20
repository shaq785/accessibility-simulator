# Accessibility Simulator

A Next.js app that lets you experience web content through different accessibility lenses.

## Features

- **Vision Lenses**: Blur (mild/moderate/severe), Contrast (low/high)
- **Color Vision**: Protanopia, Deuteranopia, Tritanopia simulations
- **Reduced Motion**: Stops all animations
- **Typography**: Font scale (125%/150%), Line height adjustments
- **Focus Aids**: Reading ruler, Tab highlight overlay
- **Findings Panel**: Context-aware accessibility notes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Routes

- `/` - Landing page
- `/simulator` - Main simulator tool
- `/simulator/demo/good` - Accessible demo page
- `/simulator/demo/bad` - Inaccessible demo page
