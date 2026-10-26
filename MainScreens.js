import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import {
  Screen, Logo, Card, FadeIn, PrimaryButton, SecondaryButton, Banner, Chip, ScreenHeader,
} from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { CREATION_TYPES } from '../lib/creationTypes';
import { generateContent, listProjects, createProject, deleteProject, isApiConfigured } from '../lib/api';
import { colors, gradients, spacing, radius, type } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const TYPE_LABEL = { website: 'Website', app: 'App UI', content: 'Content' };

/* ---------- HOME ---------- */
export function HomeScreen({ navigation }) {
  const { name } = useAuth();
  const first = name.split(' ')[0];
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Logo size={40} />
            <View>
              <Text style={type.caption}>Hello, {first}</Text>
              <Text style={type.label}>AI Creator Studio</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }} accessibilityLabel="Profile">
            <Ionicons name="person-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <FadeIn style={{ marginTop: spacing.xl }}>
          <Text style={type.h1}>Turn Your Ideas Into Reality</Text>
          <Text style={[type.body, { marginTop: spacing.sm }]}>Create websites, app designs, and content with AI.</Text>
        </FadeIn>

        <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
          {Object.entries(CREATION_TYPES).map(([key, cfg], i) => (
            <FadeIn key={key} delay={150 + i * 120}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                  <LinearGradient colors={gradients.brand} style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={cfg.icon} size={26} color="#fff" />
                  </LinearGradient>
                  <Text style={[type.h2, { flex: 1 }]}>{cfg.title}</Text>
                </View>
                <Text style={[type.body, { marginTop: spacing.md }]}>{cfg.description}</Text>
                <View style={{ marginTop: spacing.md }}>
                  <PrimaryButton title="Create Now" onPress={() => navigation.navigate('Workspace', { type: key })} />
                </View>
              </Card>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ---------- WORKSPACE ---------- */
export function WorkspaceScreen({ route, navigation }) {
  const cfg = CREATION_TYPES[route.params.type];
  const typeKey = route.params.type;
  const { session } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState(cfg.styles[0]);
  const [output, setOutput] = useState(cfg.outputs[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [setupNotice, setSetupNotice] = useState(false);

  const generate = async () => {
    setError(''); setSetupNotice(false);
    if (prompt.trim().length < 10) return setError('Describe your idea in at least 10 characters.');
    if (!isApiConfigured) return setSetupNotice(true);
    setBusy(true);
    try {
      const result = await generateContent(session?.access_token, {
        type: typeKey, prompt: prompt.trim(), style, output,
      });
      navigation.navigate('Results', { type: typeKey, prompt: prompt.trim(), style, output, result });
    } catch (e) {
      if (e.setup) setSetupNotice(true);
      else setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title={cfg.title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }} keyboardShouldPersistTaps="handled">
        {setupNotice ? (
          <Banner kind="info">
            <Text style={type.label}>Setup required</Text>{'\n'}
            The AI API is not connected yet. Add ANTHROPIC_API_KEY to the backend and set EXPO_PUBLIC_API_URL in the app. No sample output is shown.
          </Banner>
        ) : null}
        {error ? <Banner kind="error">{error}</Banner> : null}

        <Text style={type.label}>Your idea</Text>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          multiline
          placeholder={cfg.placeholder}
          placeholderTextColor={colors.textMuted}
          maxLength={4000}
          textAlignVertical="top"
          style={{
            minHeight: 180, marginTop: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md,
            borderWidth: 1, borderColor: colors.border, color: colors.text, padding: spacing.md, fontSize: 16,
          }}
        />

        <Text style={[type.label, { marginTop: spacing.lg }]}>Example prompts</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {cfg.examples.map((ex) => (
            <Chip key={ex} label={ex.length > 42 ? ex.slice(0, 40) + '…' : ex} onPress={() => setPrompt(ex)} />
          ))}
        </View>

        <Text style={[type.label, { marginTop: spacing.lg }]}>Style</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {cfg.styles.map((s) => <Chip key={s} label={s} selected={style === s} onPress={() => setStyle(s)} />)}
        </View>

        <Text style={[type.label, { marginTop: spacing.md }]}>Output</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
          {cfg.outputs.map((o) => <Chip key={o} label={o} selected={output === o} onPress={() => setOutput(o)} />)}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton title={busy ? 'Generating…' : 'Generate'} onPress={generate} loading={busy} />
          {busy ? (
            <Text style={[type.caption, { textAlign: 'center', marginTop: spacing.sm }]}>
              This can take up to a minute. Keep the app open.
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ---------- RESULTS ---------- */
const safeFileName = (p) => p.replace(/[^a-zA-Z0-9._-]/g, '_') || 'output.txt';

export function ResultsScreen({ route, navigation }) {
  const { type, prompt, result, projectId } = route.params;
  const { session } = useAuth();
  const isCode = Array.isArray(result?.files);
  const files = isCode ? result.files : [{ path: `${type}-content.txt`, content: result?.text ?? '' }];
  const [active, setActive] = useState(0);
  const [notice, setNotice] = useState('');
  const [saved, setSaved] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const file = files[active];

  const copy = async () => {
    await Clipboard.setStringAsync(file.content);
    setNotice('Copied to clipboard.');
  };

  const download = async () => {
    try {
      const path = FileSystem.cacheDirectory + safeFileName(file.path);
      await FileSystem.writeAsStringAsync(path, file.content, { encoding: FileSystem.EncodingType.UTF8 });
      if (!(await Sharing.isAvailableAsync())) return setNotice('Sharing is not available on this device.');
      await Sharing.shareAsync(path, { mimeType: 'text/plain', dialogTitle: 'Save file' });
    } catch (e) {
      setNotice(`Could not prepare the file: ${e.message}`);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await createProject(session?.access_token, {
        name: prompt.slice(0, 60), type, prompt, result,
      });
      setSaved(true);
      setNotice('Saved to My Projects.');
    } catch (e) {
      setNotice(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader title="Result" onBack={() => navigation.goBack()} />
      <View style={{ paddingHorizontal: spacing.lg, flex: 1 }}>
        {notice ? <Banner kind="info">{notice}</Banner> : null}

        {isCode && files.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: spacing.md }}>
            {files.map((f, i) => (
              <Chip key={f.path + i} label={f.path} selected={i === active} onPress={() => setActive(i)} />
            ))}
          </ScrollView>
        ) : null}

        {isCode ? <Text style={[type.caption, { marginBottom: spacing.sm }]}>{file.path}</Text> : null}

        <ScrollView style={{ flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border }} contentContainerStyle={{ padding: spacing.md }}>
          <ScrollView horizontal>
            <Text selectable style={{
              color: colors.text, fontSize: 13, lineHeight: 19,
              fontFamily: Platform.select({ android: 'monospace', default: 'Courier' }),
            }}>
              {isCode ? file.content : file.content}
            </Text>
          </ScrollView>
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.md }}>
          <View style={{ flex: 1 }}><SecondaryButton title={isCode ? 'Copy Code' : 'Copy'} onPress={copy} /></View>
          <View style={{ flex: 1 }}><SecondaryButton title="Download" onPress={download} /></View>
        </View>
        <View style={{ marginBottom: spacing.md }}>
          <PrimaryButton title={saved ? 'Saved' : 'Save to My Projects'} onPress={save} loading={saving} disabled={saved} />
        </View>
      </View>
    </Screen>
  );
}

/* ---------- MY PROJECTS ---------- */
export function ProjectsScreen({ navigation }) {
  const { session, configured } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    if (!configured) return setError('Sign-in is not configured yet, so projects cannot be loaded.');
    if (!isApiConfigured) return setError('Backend not configured. Set EXPO_PUBLIC_API_URL in mobile/.env.');
    setLoading(true);
    try {
      setProjects(await listProjects(session?.access_token));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [configured, session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (project) => {
    Alert.alert('Delete project?', `"${project.name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteProject(session?.access_token, project.id);
            setProjects((list) => list.filter((p) => p.id !== project.id));
          } catch (e) {
            setError(e.message);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <Text style={type.h1}>My Projects</Text>
        <Text style={[type.body, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>Only you can see these projects.</Text>
        {error ? <Banner kind="error">{error}</Banner> : null}
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {!loading && !error && projects.length === 0 ? (
          <Card><Text style={type.body}>No saved projects yet. Generate something and tap "Save to My Projects".</Text></Card>
        ) : null}
        <View style={{ gap: spacing.md }}>
          {projects.map((p) => (
            <Card key={p.id}>
              <Text style={type.h2} numberOfLines={2}>{p.name}</Text>
              <Text style={[type.caption, { marginTop: spacing.xs }]}>
                {TYPE_LABEL[p.type] || p.type} · {new Date(p.created_at).toLocaleDateString()}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton title="Open" onPress={() => navigation.navigate('Results', {
                    type: p.type, prompt: p.prompt, result: p.result, projectId: p.id,
                  })} />
                </View>
                <View style={{ flex: 1 }}>
                  <SecondaryButton title="Delete" danger onPress={() => confirmDelete(p)} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* ---------- PROFILE ---------- */
export function ProfileScreen({ navigation }) {
  const { name, user, signOut } = useAuth();
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const verified = Boolean(user?.email_confirmed_at);

  const logout = () => {
    Alert.alert('Log out?', 'You will need to log in again to access your projects.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const Row = ({ icon, label, onPress, hint }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, gap: spacing.md }}>
      <Ionicons name={icon} size={20} color={colors.accent} />
      <Text style={[type.label, { flex: 1 }]}>{label}</Text>
      {hint ? <Text style={type.caption}>{hint}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <LinearGradient colors={gradients.brand} style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>{initials}</Text>
          </LinearGradient>
          <Text style={[type.h2, { marginTop: spacing.md }]}>{name}</Text>
          <Text style={type.body}>{user?.email}</Text>
          <Text style={[type.caption, { marginTop: spacing.xs, color: verified ? colors.success : colors.textMuted }]}>
            {verified ? 'Email verified' : 'Email not verified'}
          </Text>
        </View>

        <Card>
          <Row icon="folder-outline" label="My Projects" onPress={() => navigation.navigate('Projects')} />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <Row
            icon="settings-outline"
            label="Account settings"
            hint="Coming soon"
            onPress={() => Alert.alert('Not yet available', 'Account settings are planned for a later release.')}
          />
        </Card>

        <View style={{ marginTop: spacing.xl }}>
          <SecondaryButton title="Log out" danger onPress={logout} />
        </View>
      </ScrollView>
    </Screen>
  );
}
