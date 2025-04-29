# 3D Model Configurator

A powerful 3D model customization tool built with React, Three.js, and related libraries. This project allows users to customize 3D models (shirt or cube) by changing colors, applying decals, and positioning them anywhere on the model surface.

## Features

- **Interactive 3D Models**: Choose between a shirt or cube model
- **360° Model Rotation**: Rotate models to view and customize from any angle
- **Multi-Position Decal Support**: Place different decals at multiple positions on the shirt (front, left shoulder, right shoulder)
- **Independent Decal Control**: Toggle visibility and customize each decal separately
- **Decal Dragging**: Precisely position decals by dragging them
- **Color Customization**: Choose from a variety of colors for the model
- **Custom Image Upload**: Upload your own images to use as decals
- **Download**: Save your customized design as an image

## How to Use

1. **Model Controls**:
   - Switch between shirt and cube models
   - Toggle between model rotation and decal movement modes
   - Select colors to change the model appearance

2. **Decal Position Selection** (Shirt model only):
   - Choose between Front, Left Shoulder, and Right Shoulder positions
   - Each position can have its own decal (built-in or custom uploaded)

3. **Decal Controls**:
   - Choose from pre-made decals or upload your own image for the selected position
   - When decal movement is ON: Click and drag to position decals on the model
   - When decal movement is OFF: Click and drag to rotate the model
   - Remove decals from specific positions as needed

4. **Utilities**:
   - Download your customized design as an image
   - Toggle debug mode for advanced users

## Technical Implementation

- **Multi-Position Decal System**: Support for multiple decals at predefined positions with independent control
- **Position-Specific State Management**: Each decal position maintains its own state (visibility, image, position, rotation, scale)
- **Raycasting**: Decals can be placed anywhere on the model using raycasting to determine surface intersection points
- **Surface Normal Alignment**: Decals automatically align with the surface normal for proper orientation
- **Local Coordinate System**: Decals maintain their position during model rotation by using local model coordinates
- **Drag Handling**: Specialized drag handling prevents decals from jumping to unintended positions

## Technologies Used

- **React**: Frontend framework
- **Three.js**: 3D rendering library
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **Valtio**: State management
- **Framer Motion**: Animation library

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/Canvas.js`: Main 3D rendering and interaction logic
- `src/ControlPanel.js`: UI controls for model customization
- `src/store.js`: Global state management
- `src/Overlay.js`: UI overlay components
- `src/DecalManipulator.js`: Component for manipulating decals (scale, rotate, position)

## Latest Updates

- Added multi-position decal support for the t-shirt model
- Implemented independent control for each decal position
- Enhanced the UI with position selector buttons
- Improved state management for better decal handling
- Fixed various bugs related to decal positioning and rendering

## Credits

Originally created with CodeSandbox and enhanced with advanced 3D interaction capabilities.
