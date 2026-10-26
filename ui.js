import React, { useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Animated, StyleSheet, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients, radius, spacing, type } from '../theme';

export function Screen({ children, style }) {
  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <SafeAreaView style={[{ flex: 1 }, style]} edges={['top', 'bottom']}>{children}</SafeAreaView>
    </LinearGradient>
  );
}

export function Logo({ size = 84 }) {
  return (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.3, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name="sparkles" size={size * 0.45} color="#fff" />
    </LinearGradient>
  );
}

export function FadeIn({ children, delay = 0, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 400, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, translate, delay]);
  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: translate }] }, style]}>{children}</Animated.View>
  );
}

export function ScreenHeader({ title, onBack, right }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.iconBtn} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      ) : <View style={styles.iconBtn} />}
      <Text style={[type.h2, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>{title}</Text>
      {right ?? <View style={styles.iconBtn} />}
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading, disabled }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={{ opacity: disabled ? 0.5 : 1 }}>
      <LinearGradient colors={gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.button}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ title, onPress, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.button, styles.secondary, danger && { borderColor: colors.danger }]}
    >
      <Text style={[styles.buttonText, danger && { color: colors.danger }]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Field({ label, error, ...props }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={[type.label, { marginBottom: spacing.xs }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && { borderColor: colors.danger }]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Banner({ kind = 'info', children }) {
  const border = { error: colors.danger, success: colors.success, info: colors.accent }[kind];
  return (
    <View style={[styles.banner, { borderColor: border }]}>
      <Text style={{ color: colors.text, lineHeight: 20 }}>{children}</Text>
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
    >
      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  button: {
    height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg,
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    color: colors.text, paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: 16,
  },
  error: { color: colors.danger, fontSize: 12, marginTop: spacing.xs },
  banner: {
    backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, padding: spacing.md,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginRight: spacing.sm, marginBottom: spacing.sm,
  },
});
