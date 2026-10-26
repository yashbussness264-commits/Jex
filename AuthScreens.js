import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Screen, Logo, Field, PrimaryButton, SecondaryButton, Banner, FadeIn, ScreenHeader } from '../components/ui';
import { supabase, isSupabaseConfigured, NOT_CONFIGURED_MESSAGE } from '../lib/supabase';
import { validateRegister, isValidEmail } from '../lib/validation';
import { colors, spacing, type } from '../theme';

export function WelcomeScreen({ navigation }) {
  return (
    <Screen>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <FadeIn><Logo /></FadeIn>
        <FadeIn delay={150}>
          <Text style={[type.h1, { marginTop: spacing.lg, textAlign: 'center' }]}>AI Creator Studio</Text>
        </FadeIn>
        <FadeIn delay={300}>
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing.sm }]}>
            Turn your ideas into websites, app designs and content.
          </Text>
        </FadeIn>
      </View>
      <FadeIn delay={450} style={{ padding: spacing.lg }}>
        <View style={{ gap: spacing.md }}>
          <PrimaryButton title="Create account" onPress={() => navigation.navigate('Register')} />
          <SecondaryButton title="Log in" onPress={() => navigation.navigate('Login')} />
        </View>
      </FadeIn>
    </Screen>
  );
}

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (!isSupabaseConfigured) return setError(NOT_CONFIGURED_MESSAGE);
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    if (!password) return setError('Enter your password.');
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      setError(
        err.message === 'Email not confirmed'
          ? 'Please verify your email first. Check your inbox for the verification link.'
          : err.message,
      );
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Log in" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        {error ? <Banner kind="error">{error}</Banner> : null}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry
          autoComplete="password" placeholder="Your password" />
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: spacing.lg }}>
          <Text style={{ color: colors.accent, fontWeight: '600' }}>Forgot password?</Text>
        </TouchableOpacity>
        <PrimaryButton title="Log in" onPress={submit} loading={busy} />
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={type.body}>New here? <Text style={{ color: colors.accent, fontWeight: '700' }}>Create an account</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

export function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError(''); setSuccess('');
    if (!isSupabaseConfigured) return setError(NOT_CONFIGURED_MESSAGE);
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { full_name: form.name.trim() } },
    });
    setBusy(false);
    if (err) return setError(err.message);
    // With "Confirm email" enabled, there is no session yet and the user must verify first.
    // If confirmation is disabled, the session is set and the app switches to the main screens automatically.
    if (!data.session) {
      setSuccess(`Account created. We sent a verification link to ${form.email.trim()}. Verify your email, then log in.`);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Create account" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        {!isSupabaseConfigured ? <Banner kind="info">{NOT_CONFIGURED_MESSAGE}</Banner> : null}
        {error ? <Banner kind="error">{error}</Banner> : null}
        {success ? <Banner kind="success">{success}</Banner> : null}
        <Field label="Full name" value={form.name} onChangeText={update('name')} error={errors.name} autoComplete="name" placeholder="Ada Lovelace" />
        <Field label="Email" value={form.email} onChangeText={update('email')} error={errors.email} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
        <Field label="Password" value={form.password} onChangeText={update('password')} error={errors.password} secureTextEntry autoComplete="new-password" placeholder="At least 8 characters" />
        <Field label="Confirm password" value={form.confirm} onChangeText={update('confirm')} error={errors.confirm} secureTextEntry autoComplete="new-password" placeholder="Repeat password" />
        <PrimaryButton title="Create account" onPress={submit} loading={busy} />
        {success ? (
          <View style={{ marginTop: spacing.md }}>
            <SecondaryButton title="Go to log in" onPress={() => navigation.navigate('Login')} />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

export function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(''); setSuccess('');
    if (!isSupabaseConfigured) return setError(NOT_CONFIGURED_MESSAGE);
    if (!isValidEmail(email)) return setError('Enter a valid email address.');
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: process.env.EXPO_PUBLIC_RESET_REDIRECT_URL || undefined,
    });
    setBusy(false);
    if (err) return setError(err.message);
    // Same message whether or not the account exists, to avoid revealing registered emails.
    setSuccess('If an account exists for that email, a password reset link has been sent.');
  };

  return (
    <Screen>
      <ScreenHeader title="Reset password" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Text style={[type.body, { marginBottom: spacing.lg }]}>Enter the email linked to your account and we will send you a reset link.</Text>
        {error ? <Banner kind="error">{error}</Banner> : null}
        {success ? <Banner kind="success">{success}</Banner> : null}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
        <PrimaryButton title="Send reset link" onPress={submit} loading={busy} />
      </ScrollView>
    </Screen>
  );
}
