import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

export default function InnerShadow({top = true, bottom = true, left = false, right = false }:{
  top?: boolean,
  bottom?: boolean,
  left?: boolean,
  right?: boolean,
}) {

  const styles = StyleSheet.create({
    innerShadow: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderRadius: 12,
    },
    innerShadowVertical: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRadius: 12,
    },
  });

  return (
    <>
      {/* Inner shadow overlays */}
      {/* Top shadow */}
      {top && (<LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent']}
        style={[styles.innerShadow, { top: 0, height: 30 }]}
        pointerEvents="none"
      />)}
      {/* Bottom shadow */}
      {bottom && (<LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={[styles.innerShadow, { bottom: 0, height: 30 }]}
        pointerEvents="none"
      />)}
      {/* Left shadow */}
      {left && (<LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent']}
        style={[styles.innerShadowVertical, { left: 0, width: 30 }]}
        pointerEvents="none"
      />)}
      {/* Right shadow */}
      {right && (<LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={[styles.innerShadowVertical, { right: 0, width: 30 }]}
        pointerEvents="none"
      />)}
    </>
  )
}
