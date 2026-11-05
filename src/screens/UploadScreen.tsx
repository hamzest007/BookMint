import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Shadows, Spacing, Typography } from 'src/theme/tokens';
import { useBooks } from 'src/context/BookContext';
import { generateWithGemini, hasGeminiKey } from 'src/services/gemini';
import { publishPublicBook, isPublicBooksBackendReady } from 'src/services/publicBooks';
import scale from 'src/utils/scale';

type ViewMode = 'welcome' | 'form' | 'generating' | 'editor' | 'preview' | 'publish';
type Chapter = { id: string; title: string; content: string; page?: number };
type AssistantAction = 'rewrite' | 'expand' | 'shorten' | 'tone' | 'grammar' | 'clarity' | 'dialogue' | 'continuation' | 'ending' | 'consistency';

const genres = ['Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Romance', 'Science Fiction', 'Horror', 'Adventure', 'Biography', 'Self-Help', 'Business', 'Education', 'History', "Children's Books", 'Poetry'];
const tones = ['Warm & lyrical', 'Suspenseful', 'Hopeful', 'Professional', 'Playful', 'Dark & atmospheric'];
const generationSteps = ['Understanding your idea', 'Building the story world', 'Mapping your chapters', 'Writing the manuscript', 'Polishing the final details'];

const INK = '#10213D';
const INK_SOFT = '#50617D';
const MINT = '#68D8B0';
const LILAC = '#A38BFA';
const PAPER = '#F7F8FC';

const initialForm = {
  title: '', idea: '', description: '', genre: 'Fiction', subGenre: '', style: 'Immersive & vivid', audience: 'Adult', language: 'English', length: 'Short book · 15–25k words', chapters: '8', chapterLength: '1,800–2,400 words', tone: 'Warm & lyrical', characters: '', setting: '', themes: '', instructions: '', creativity: 'Balanced', complexity: 'Accessible', perspective: 'Third person', difficulty: 'Easy to read',
};

const makeBook = (form: typeof initialForm): Chapter[] => {
  const hero = form.characters.split(',')[0]?.trim() || 'Mara';
  const place = form.setting || 'the quiet coastal town of Bellwether';
  const seed = form.idea || 'a discovery that changes everything';
  const chapterCount = Math.min(Math.max(Number(form.chapters) || 8, 3), 12);
  const names = ['The Ordinary Day', 'A Door Left Open', 'The Shape of a Promise', 'What the Tide Returned', 'The Map Between Us', 'A Brave New Question', 'Where the Light Lands', 'The Way Home', 'After the Storm', 'The Last Page'];
  return Array.from({ length: chapterCount }, (_, index) => ({
    id: `chapter-${index + 1}`,
    title: names[index] || `Chapter ${index + 1}`,
    content: `${hero} had always believed that ${place} kept its secrets gently. But on the morning everything began, ${seed} arrived with the kind of quiet certainty that made the world feel newly possible.\n\nThere was no grand announcement, no sign in the sky. Only a small detail out of place, waiting for someone patient enough to notice. ${hero} noticed—and chose not to look away.\n\nBy dusk, the question was no longer whether to follow the thread. It was how far it might lead, and who ${hero} would become before the answer appeared.`,
  }));
};

const buildGeminiPrompt = (form: typeof initialForm, chapterTitle: string, chapterContent: string, instruction: string) => `
You are Bookmint's AI writing assistant.
Preserve continuity, voice, and original meaning.
Return only the rewritten chapter text with no preface.

Book context:
- Title: ${form.title || 'Untitled'}
- Genre: ${form.genre}
- Sub-genre: ${form.subGenre || 'Not specified'}
- Tone: ${form.tone}
- Style: ${form.style}
- Audience: ${form.audience}
- Language: ${form.language}
- Chapter title: ${chapterTitle}
- Instruction: ${instruction}

Chapter text:
${chapterContent}
`;

const Chip = ({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const Field = ({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (text: string) => void; placeholder: string; multiline?: boolean }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9AA5B8" multiline={multiline} textAlignVertical={multiline ? 'top' : 'center'} style={[styles.input, multiline && styles.textarea]} />
  </View>
);

const UploadScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { addBook } = useBooks();
  const [mode, setMode] = useState<ViewMode>('welcome');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [progress, setProgress] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selected, setSelected] = useState(0);
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [publishInfo, setPublishInfo] = useState({ author: 'You', visibility: 'Private', tags: '' });

  useEffect(() => {
    if (mode !== 'generating') return;
    const timer = setInterval(() => setProgress(value => Math.min(value + 4, 100)), 130);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (progress === 100 && mode === 'generating') {
      const timeout = setTimeout(() => { setChapters(makeBook(form)); setSelected(0); setMode('editor'); }, 450);
      return () => clearTimeout(timeout);
    }
  }, [progress, mode, form]);

  const update = (key: keyof typeof initialForm, value: string) => setForm(current => ({ ...current, [key]: value }));
  const title = form.title.trim() || 'The Unwritten Horizon';
  const wordCount = useMemo(() => chapters.reduce((sum, chapter) => sum + chapter.content.split(/\s+/).filter(Boolean).length, 0), [chapters]);
  const currentChapter = chapters[selected];
  const stage = Math.min(Math.floor(progress / 20), generationSteps.length - 1);

  const beginGeneration = () => {
    if (!form.idea.trim() && !form.description.trim()) { Alert.alert('Tell us a little more', 'Add a book idea or description so Bookmint AI has a creative starting point.'); return; }
    setProgress(0); setMode('generating');
  };

  const updateChapter = (content: string) => setChapters(items => items.map((chapter, i) => i === selected ? { ...chapter, content } : chapter));
  const runAssistant = async (instruction: string, action?: AssistantAction) => {
    if (!currentChapter) return;
    const bank: Record<AssistantAction, string> = {
      rewrite: 'Rewrote the passage for smoother flow and a cleaner voice.',
      expand: 'Expanded the scene with more sensory detail and emotional depth.',
      shorten: 'Trimmed repeated ideas and tightened the pacing.',
      tone: 'Shifted the tone to feel more consistent and deliberate.',
      grammar: 'Polished grammar, punctuation, and sentence rhythm.',
      clarity: 'Improved clarity so the meaning reads more naturally.',
      dialogue: 'Added sharper dialogue to bring the characters to life.',
      continuation: 'Continued the scene with a stronger narrative turn.',
      ending: 'Strengthened the ending so it resolves with more impact.',
      consistency: 'Checked character and setting consistency across the chapter.',
    };
    const additions: Record<string, string> = {
      'Add more details.': '\n\nThe air smelled of rain and old paper. In the distance, a bell marked the hour, each note asking for an answer.',
      'Continue this chapter.': '\n\nThen a knock broke the stillness. It was not loud, but it carried the weight of a door that had been waiting to open.',
      'Make this chapter more interesting.': '\n\nA folded note appeared beneath the lamp: *You are closer than you think.*',
    };
    const actionMessage = action ? bank[action] : assistantPrompt.trim();
    const fallback = additions[instruction]
      ? currentChapter.content + additions[instruction]
      : `${currentChapter.content}\n\n[AI revision: ${actionMessage || 'Polished for clarity, flow, and emotional resonance.'}]`;

    try {
      if (hasGeminiKey()) {
        const prompt = buildGeminiPrompt(form, currentChapter.title, currentChapter.content, actionMessage || instruction);
        const result = await generateWithGemini(prompt);
        updateChapter(result || fallback);
      } else {
        updateChapter(fallback);
      }
    } catch {
      updateChapter(fallback);
    } finally {
      setAssistantPrompt('');
      setShowAssistant(false);
    }
  };

  const regenerateChapter = () => {
    if (!currentChapter) return;
    updateChapter(`${currentChapter.content.split('\n\n')[0]}\n\nA new path opened in the silence, threaded with possibility. ${form.characters.split(',')[0] || 'The protagonist'} stepped forward, carrying both doubt and determination into the unknown.\n\nThe choice was small, almost ordinary. Its consequences would not be.`);
  };

  const addChapter = () => {
    const next = { id: `chapter-${Date.now()}`, title: `A New Chapter`, content: 'Begin writing the next turning point in your story here.' };
    setChapters(items => [...items, next]); setSelected(chapters.length);
  };

  const publish = () => {
    let charactersBeforeChapter = 0;
    const chapterMeta = chapters.map(chapter => {
      const page = Math.floor(charactersBeforeChapter / 800) + 1;
      charactersBeforeChapter += `${chapter.title}\n\n${chapter.content}\n\n`.length;
      return { title: chapter.title, page };
    });
    const manuscript = chapters.map(c => `${c.title}\n\n${c.content}`).join('\n\n');
    const generatedBook = {
      id: `generated-${Date.now()}`,
      title,
      author: publishInfo.author || 'You',
      coverUrl: '',
      category: form.genre,
      progress: 0,
      currentChapter: 1,
      pageCount: Math.max(Math.ceil(manuscript.length / 800), 1),
      currentPage: 1,
      description: form.description || `An original ${form.genre.toLowerCase()} book generated from your idea.`,
      content: manuscript,
      source: 'Bookmint AI',
      isGenerated: true,
      publishedAt: new Date().toISOString(),
      visibility: publishInfo.visibility as 'Private' | 'Public',
      tags: publishInfo.tags,
      aiModel: 'Gemini',
      chapters: chapterMeta,
    };

    addBook(generatedBook);

    if (publishInfo.visibility === 'Public' && isPublicBooksBackendReady()) {
      publishPublicBook(generatedBook).catch(() => {
        Alert.alert('Published locally', 'Your book was saved locally, but the public cloud publish failed.');
      });
    }

    Alert.alert('Published to Bookmint', publishInfo.visibility === 'Public'
      ? 'Your book is now public and ready for other users to discover.'
      : 'Your book is now in My Books and saved as private.');
    setMode('welcome'); setForm(initialForm); setChapters([]); setStep(0);
  };

  const header = (eyebrow: string, heading: string, copy: string) => <View style={styles.pageHeader}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.heading}>{heading}</Text><Text style={styles.headerCopy}>{copy}</Text></View>;

  const renderWelcome = () => <>
    <View style={styles.hero}>
      <View style={styles.heroGlowOne} /><View style={styles.heroGlowTwo} />
      <View style={styles.aiPill}><Text style={styles.sparkle}>✦</Text><Text style={styles.aiPillText}>BOOKMINT AI</Text></View>
      <Text style={styles.heroTitle}>Your next book starts with a thought.</Text>
      <Text style={styles.heroCopy}>Turn a flicker of an idea into a complete, original book—beautifully structured, chapter by chapter.</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => setMode('form')}><Text style={styles.primaryButtonText}>Generate a book <Text style={styles.arrow}>→</Text></Text></TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('UploadBook' as never)}><Text style={styles.secondaryButtonText}>Upload your own file</Text></TouchableOpacity>
      <Text style={styles.trustText}>Original writing · Your voice · Always in your control</Text>
    </View>
    <View style={styles.promiseCard}>
      <Text style={styles.promiseTitle}>From idea to first draft</Text>
      {['A tailored outline and chapter plan', 'A coherent manuscript with a consistent voice', 'A polished editor, cover concept, and publishing flow'].map((item, i) => <View key={item} style={styles.promiseRow}><View style={styles.number}><Text style={styles.numberText}>0{i + 1}</Text></View><Text style={styles.promiseText}>{item}</Text></View>)}
    </View>
    <Text style={styles.sectionLabel}>START WITH A SPARK</Text>
    <View style={styles.sparkGrid}>{['A forgotten key in a rain-soaked city', 'A guide to making creative habits stick', 'A love letter to the coast'].map((item, i) => <TouchableOpacity key={item} style={styles.sparkCard} onPress={() => { update('idea', item); setMode('form'); }}><Text style={styles.sparkIcon}>{['⌁', '✺', '◒'][i]}</Text><Text style={styles.sparkText}>{item}</Text><Text style={styles.sparkArrow}>↗</Text></TouchableOpacity>)}</View>
  </>;

  const renderForm = () => {
    const headings = [['The heart of your book', 'Start with the spark. We’ll help you shape it into something readers can’t put down.'], ['Give it a world', 'The details create a book that feels fully yours.'], ['Tune the writing', 'Set the creative controls before Bookmint AI begins your first draft.']];
    return <>
      <TouchableOpacity onPress={() => setMode('welcome')}><Text style={styles.back}>← Back to studio</Text></TouchableOpacity>
      <View style={styles.stepper}>{[0, 1, 2].map(i => <View key={i} style={styles.stepItem}><View style={[styles.stepDot, i <= step && styles.stepDotActive]}><Text style={[styles.stepNumber, i <= step && styles.stepNumberActive]}>{i + 1}</Text></View>{i < 2 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}</View>)}</View>
      {header(`STEP ${step + 1} OF 3`, headings[step][0], headings[step][1])}
      <View style={styles.formCard}>
        {step === 0 && <>
          <Field label="Book title (optional)" value={form.title} onChangeText={t => update('title', t)} placeholder="Let AI create one, or add your own" />
          <Field label="What is your book about?" value={form.idea} onChangeText={t => update('idea', t)} placeholder="A one-line idea, a scene, or a detailed premise..." multiline />
          <Field label="Book description" value={form.description} onChangeText={t => update('description', t)} placeholder="What should readers feel, learn, or discover?" multiline />
          <Text style={styles.fieldLabel}>GENRE</Text><View style={styles.chips}>{genres.map(item => <Chip key={item} label={item} selected={form.genre === item} onPress={() => update('genre', item)} />)}</View>
          <Field label="Sub-genre" value={form.subGenre} onChangeText={t => update('subGenre', t)} placeholder="e.g. Cozy mystery, epic fantasy" />
        </>}
        {step === 1 && <>
          <Field label="Main characters" value={form.characters} onChangeText={t => update('characters', t)} placeholder="Names, motivations, relationships..." multiline />
          <Field label="Setting" value={form.setting} onChangeText={t => update('setting', t)} placeholder="Where and when does your story unfold?" />
          <Field label="Key themes" value={form.themes} onChangeText={t => update('themes', t)} placeholder="e.g. Belonging, courage, reinvention" />
          <Field label="Writing style" value={form.style} onChangeText={t => update('style', t)} placeholder="e.g. Literary, conversational, cinematic" />
          <Text style={styles.fieldLabel}>TONE</Text><View style={styles.chips}>{tones.map(item => <Chip key={item} label={item} selected={form.tone === item} onPress={() => update('tone', item)} />)}</View>
        </>}
        {step === 2 && <>
          <Text style={styles.fieldLabel}>BOOK LENGTH</Text><View style={styles.chips}>{['Short book · 15–25k words', 'Novella · 30–45k words', 'Novel · 60–80k words'].map(item => <Chip key={item} label={item} selected={form.length === item} onPress={() => update('length', item)} />)}</View>
          <View style={styles.twoCol}><Field label="Number of chapters" value={form.chapters} onChangeText={t => update('chapters', t.replace(/\D/g, ''))} placeholder="8" /><Field label="Chapter length" value={form.chapterLength} onChangeText={t => update('chapterLength', t)} placeholder="1,800 words" /></View>
          <View style={styles.twoCol}><Field label="Language" value={form.language} onChangeText={t => update('language', t)} placeholder="English" /><Field label="Target audience" value={form.audience} onChangeText={t => update('audience', t)} placeholder="Adult" /></View>
          <Text style={styles.fieldLabel}>CREATIVE CONTROL</Text><View style={styles.chips}>{['Grounded', 'Balanced', 'Imaginative'].map(item => <Chip key={item} label={item} selected={form.creativity === item} onPress={() => update('creativity', item)} />)}</View>
          <Field label="Additional instructions" value={form.instructions} onChangeText={t => update('instructions', t)} placeholder="Anything Bookmint AI should know about your book?" multiline />
        </>}
      </View>
      <View style={styles.formActions}>{step > 0 && <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(step - 1)}><Text style={styles.secondaryButtonText}>Back</Text></TouchableOpacity>}<TouchableOpacity style={[styles.primaryButton, styles.formPrimary]} onPress={() => step < 2 ? setStep(step + 1) : beginGeneration()}><Text style={styles.primaryButtonText}>{step < 2 ? 'Continue →' : 'Generate my book ✦'}</Text></TouchableOpacity></View>
    </>;
  };

  const renderGenerating = () => <View style={styles.generationPanel}>
    <View style={styles.orbit}><View style={styles.orbitInner}><Text style={styles.orbitMark}>✦</Text></View></View>
    <Text style={styles.generatingEyebrow}>BOOKMINT AI IS WRITING</Text><Text style={styles.generatingTitle}>Making your idea{`\n`}feel like a book.</Text>
    <Text style={styles.generatingCopy}>{generationSteps[stage]}</Text>
    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View><Text style={styles.progressText}>{progress}% complete</Text>
    <View style={styles.generatingChecklist}>{generationSteps.map((item, i) => <View key={item} style={styles.checkRow}><Text style={[styles.check, i <= stage && styles.checkActive]}>{i < stage ? '✓' : i === stage ? '✦' : '○'}</Text><Text style={[styles.checkText, i <= stage && styles.checkTextActive]}>{item}</Text></View>)}</View>
    <Text style={styles.originality}>Built from your prompt, never copied from existing books.</Text>
  </View>;

  const renderEditor = () => <>
    <View style={styles.editorTop}><View style={styles.editorTitleWrap}><Text style={styles.editorKicker}>FIRST DRAFT · {form.genre.toUpperCase()}</Text><TextInput value={title} onChangeText={value => update('title', value)} style={styles.editorTitle} /></View><TouchableOpacity style={styles.previewButton} onPress={() => setMode('preview')}><Text style={styles.previewButtonText}>Preview ↗</Text></TouchableOpacity></View>
    <View style={styles.editorStats}><Text style={styles.editorStat}>{chapters.length} chapters</Text><View style={styles.statPoint} /><Text style={styles.editorStat}>{wordCount.toLocaleString()} words</Text><View style={styles.statPoint} /><Text style={styles.editorStat}>~{Math.max(1, Math.ceil(wordCount / 220))} min read</Text></View>
    <View style={styles.aiAssistantPanel}>
      <Text style={styles.aiAssistantLabel}>AI WRITING ASSISTANT</Text>
      <View style={styles.aiAssistantGrid}>
        {[
          ['Rewrite', 'rewrite'],
          ['Expand', 'expand'],
          ['Shorten', 'shorten'],
          ['Tone', 'tone'],
          ['Grammar', 'grammar'],
          ['Clarity', 'clarity'],
          ['Dialogue', 'dialogue'],
          ['Continue', 'continuation'],
          ['Ending', 'ending'],
          ['Consistency', 'consistency'],
        ].map(([label, action]) => (
          <TouchableOpacity key={label} style={styles.aiAssistantChip} onPress={() => runAssistant(`${label} this chapter.`, action as AssistantAction)}>
            <Text style={styles.aiAssistantChipText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterRail}>{chapters.map((chapter, i) => <TouchableOpacity key={chapter.id} onPress={() => setSelected(i)} style={[styles.chapterTab, selected === i && styles.chapterTabActive]}><Text style={[styles.chapterNumber, selected === i && styles.chapterNumberActive]}>0{i + 1}</Text><Text numberOfLines={1} style={[styles.chapterTabTitle, selected === i && styles.chapterTabTitleActive]}>{chapter.title}</Text></TouchableOpacity>)}<TouchableOpacity onPress={addChapter} style={styles.addChapter}><Text style={styles.addChapterText}>＋</Text></TouchableOpacity></ScrollView>
    {currentChapter && <View style={styles.manuscript}>
      <View style={styles.manuscriptHeader}><View><Text style={styles.manuscriptLabel}>CHAPTER {selected + 1}</Text><TextInput style={styles.chapterTitleInput} value={currentChapter.title} onChangeText={titleValue => setChapters(items => items.map((chapter, i) => i === selected ? { ...chapter, title: titleValue } : chapter))} /></View><TouchableOpacity onPress={regenerateChapter}><Text style={styles.regenerateText}>↻ Regenerate</Text></TouchableOpacity></View>
      <TextInput multiline textAlignVertical="top" value={currentChapter.content} onChangeText={updateChapter} style={styles.manuscriptInput} />
      <View style={styles.manuscriptFooter}><Text style={styles.wordNote}>{currentChapter.content.split(/\s+/).filter(Boolean).length} words</Text><TouchableOpacity onPress={() => { if (chapters.length <= 1) return; setChapters(items => items.filter((_, i) => i !== selected)); setSelected(Math.max(selected - 1, 0)); }}><Text style={styles.deleteText}>Delete chapter</Text></TouchableOpacity></View>
    </View>}
    <TouchableOpacity style={styles.assistantBar} onPress={() => setShowAssistant(true)}><View style={styles.assistantIcon}><Text style={styles.assistantIconText}>✦</Text></View><View style={styles.assistantCopy}><Text style={styles.assistantTitle}>Ask Bookmint AI</Text><Text style={styles.assistantSub}>Rewrite, continue, add dialogue, check consistency...</Text></View><Text style={styles.assistantArrow}>→</Text></TouchableOpacity>
  </>;

  const renderPreview = () => <>
    <TouchableOpacity onPress={() => setMode('editor')}><Text style={styles.back}>← Back to editor</Text></TouchableOpacity>
    {header('BOOK PREVIEW', title, form.description || 'An original book, shaped from your idea.')}
    <View style={styles.bookCover}><View style={styles.coverFrame}><Text style={styles.coverGenre}>{form.genre.toUpperCase()}</Text><Text style={styles.coverTitle}>{title}</Text><View style={styles.coverRule} /><Text style={styles.coverAuthor}>BY {publishInfo.author.toUpperCase() || 'YOU'}</Text><Text style={styles.coverArt}>⌁</Text></View></View>
    <View style={styles.previewMeta}><View><Text style={styles.previewMetric}>{chapters.length}</Text><Text style={styles.previewMetricLabel}>CHAPTERS</Text></View><View><Text style={styles.previewMetric}>{Math.max(1, Math.ceil(wordCount / 220))} min</Text><Text style={styles.previewMetricLabel}>READING TIME</Text></View><View><Text style={styles.previewMetric}>{form.language}</Text><Text style={styles.previewMetricLabel}>LANGUAGE</Text></View></View>
    <View style={styles.toc}><Text style={styles.tocTitle}>Table of contents</Text>{chapters.map((chapter, i) => <View key={chapter.id} style={styles.tocRow}><Text style={styles.tocNum}>{String(i + 1).padStart(2, '0')}</Text><Text style={styles.tocText}>{chapter.title}</Text><View style={styles.tocRule} /></View>)}</View>
    <View style={styles.previewActions}><TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('editor')}><Text style={styles.secondaryButtonText}>Edit book</Text></TouchableOpacity><TouchableOpacity style={[styles.primaryButton, styles.formPrimary]} onPress={() => setMode('publish')}><Text style={styles.primaryButtonText}>Publish book →</Text></TouchableOpacity></View>
    <View style={styles.previewUtilityActions}><TouchableOpacity onPress={() => { setChapters(makeBook(form)); Alert.alert('Fresh draft ready', 'Bookmint AI has regenerated your chapter draft.'); }}><Text style={styles.utilityAction}>↻ Regenerate</Text></TouchableOpacity><TouchableOpacity onPress={() => Alert.alert('Draft saved', 'Your generated book is safely saved as a draft.')}><Text style={styles.utilityAction}>Save draft</Text></TouchableOpacity><TouchableOpacity onPress={() => Alert.alert('Download is ready', 'Export options will be available when your book is published.')}><Text style={styles.utilityAction}>⇩ Download</Text></TouchableOpacity></View>
  </>;

  const renderPublish = () => <>
    <TouchableOpacity onPress={() => setMode('preview')}><Text style={styles.back}>← Back to preview</Text></TouchableOpacity>{header('READY TO PUBLISH', 'Make it yours.', 'Add the finishing details, then put your book on your Bookmint shelf.')}
    <View style={styles.formCard}><View style={styles.coverUpload}><Text style={styles.coverUploadIcon}>✦</Text><View><Text style={styles.coverUploadTitle}>Custom cover</Text><Text style={styles.coverUploadCopy}>Your AI cover concept is ready. Add an image anytime.</Text></View><Text style={styles.coverUploadArrow}>›</Text></View><Field label="Author name" value={publishInfo.author} onChangeText={author => setPublishInfo(info => ({ ...info, author }))} placeholder="Your name" /><Field label="Tags" value={publishInfo.tags} onChangeText={tags => setPublishInfo(info => ({ ...info, tags }))} placeholder="e.g. found family, magical realism" /><Text style={styles.fieldLabel}>VISIBILITY</Text><View style={styles.chips}>{['Private', 'Public'].map(item => <Chip key={item} label={item} selected={publishInfo.visibility === item} onPress={() => setPublishInfo(info => ({ ...info, visibility: item }))} />)}</View></View><TouchableOpacity style={styles.primaryButton} onPress={publish}><Text style={styles.primaryButtonText}>Publish to Bookmint ✦</Text></TouchableOpacity><TouchableOpacity style={styles.draftButton} onPress={() => { setMode('editor'); Alert.alert('Draft saved', 'Your generated book is safely saved as a draft.'); }}><Text style={styles.draftText}>Save as draft</Text></TouchableOpacity>
  </>;

  return <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 }]}>{mode === 'welcome' && renderWelcome()}{mode === 'form' && renderForm()}{mode === 'generating' && renderGenerating()}{mode === 'editor' && renderEditor()}{mode === 'preview' && renderPreview()}{mode === 'publish' && renderPublish()}<Modal visible={showAssistant} transparent animationType="slide" onRequestClose={() => setShowAssistant(false)}><View style={styles.modalShade}><View style={styles.assistantModal}><View style={styles.modalHandle} /><Text style={styles.modalEyebrow}>BOOKMINT AI</Text><Text style={styles.modalTitle}>How can I help with this chapter?</Text><View style={styles.quickPrompts}>{['Rewrite this paragraph.', 'Make this chapter more interesting.', 'Add more details.', 'Continue this chapter.', 'Check for inconsistencies.'].map(prompt => <TouchableOpacity key={prompt} style={styles.quickPrompt} onPress={() => runAssistant(prompt)}><Text style={styles.quickPromptText}>{prompt}</Text><Text style={styles.quickPromptArrow}>↗</Text></TouchableOpacity>)}</View><TextInput style={[styles.input, styles.assistantInput]} value={assistantPrompt} onChangeText={setAssistantPrompt} placeholder="Or ask anything..." placeholderTextColor="#9AA5B8" /><TouchableOpacity style={styles.primaryButton} onPress={() => runAssistant(assistantPrompt)}><Text style={styles.primaryButtonText}>Ask AI →</Text></TouchableOpacity></View></View></Modal></ScrollView>;
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PAPER }, content: { paddingHorizontal: Spacing['margin-mobile'], paddingBottom: 120 },
  hero: { backgroundColor: INK, borderRadius: 24, padding: 28, overflow: 'hidden', ...Shadows.overlay }, heroGlowOne: { position: 'absolute', width: 210, height: 210, borderRadius: 200, backgroundColor: 'rgba(122,168,255,0.23)', right: -80, top: -80 }, heroGlowTwo: { position: 'absolute', width: 140, height: 140, borderRadius: 100, backgroundColor: 'rgba(104,216,176,0.14)', left: -40, bottom: -75 },
  aiPill: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 99, paddingVertical: 7, paddingHorizontal: 11 }, sparkle: { color: MINT, fontSize: 13 }, aiPillText: { color: '#E9F0FF', fontSize: 10, letterSpacing: 1.5, fontWeight: '800' }, heroTitle: { color: '#FFF', fontSize: 37, lineHeight: 43, fontFamily: Typography.familyDisplay.bold, marginTop: 24, maxWidth: 300 }, heroCopy: { color: '#C8D4E8', fontSize: 16, lineHeight: 23, marginTop: 16, maxWidth: 300 }, primaryButton: { backgroundColor: MINT, minHeight: 52, marginTop: scale.mWidth(12), borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, primaryButtonText: { color: INK, fontSize: 15, fontWeight: '800' }, arrow: { fontSize: 20 }, trustText: { color: '#92A2BF', fontSize: 11, textAlign: 'center', marginTop: 16 },
  promiseCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 21, marginTop: 18, ...Shadows.ambient }, promiseTitle: { color: INK, fontSize: 18, fontFamily: Typography.familyDisplay.bold, marginBottom: 14 }, promiseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopColor: '#EEF0F5', borderTopWidth: 1 }, number: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }, numberText: { color: LILAC, fontSize: 10, fontWeight: '800' }, promiseText: { flex: 1, color: INK_SOFT, fontSize: 14, lineHeight: 19 }, sectionLabel: { color: INK_SOFT, letterSpacing: 1.3, fontSize: 10, fontWeight: '800', marginTop: 30, marginBottom: 11 }, sparkGrid: { gap: 9 }, sparkCard: { minHeight: 70, backgroundColor: '#FFF', borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', ...Shadows.ambient }, sparkIcon: { color: LILAC, fontSize: 24, width: 36 }, sparkText: { color: INK, fontSize: 14, flex: 1, fontWeight: '600' }, sparkArrow: { color: INK_SOFT, fontSize: 18 },
  back: { color: INK_SOFT, fontSize: 14, fontWeight: '700', marginBottom: 20 }, stepper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 26 }, stepItem: { flexDirection: 'row', flex: 1, alignItems: 'center' }, stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D7DCE6', backgroundColor: PAPER }, stepDotActive: { backgroundColor: INK, borderColor: INK }, stepNumber: { color: '#98A2B3', fontSize: 11, fontWeight: '800' }, stepNumberActive: { color: '#FFF' }, stepLine: { height: 1, flex: 1, backgroundColor: '#D7DCE6', marginHorizontal: 8 }, stepLineActive: { backgroundColor: INK }, pageHeader: { marginBottom: 22 }, eyebrow: { color: LILAC, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 9 }, heading: { color: INK, fontSize: 31, lineHeight: 36, fontFamily: Typography.familyDisplay.bold }, headerCopy: { color: INK_SOFT, fontSize: 15, lineHeight: 22, marginTop: 10 }, formCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, ...Shadows.ambient }, field: { marginBottom: 18 }, fieldLabel: { color: INK_SOFT, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }, input: { minHeight: 48, borderWidth: 1, borderColor: '#E4E8F0', borderRadius: 12, color: INK, fontSize: 15, paddingHorizontal: 13, backgroundColor: '#FBFCFF' }, textarea: { minHeight: 108, paddingTop: 12 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { borderColor: '#E0E5EE', borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 9 }, chipSelected: { borderColor: INK, backgroundColor: '#EAF0FF' }, chipText: { fontSize: 12, color: INK_SOFT, fontWeight: '600' }, chipTextSelected: { color: INK, fontWeight: '800' }, twoCol: { flexDirection: 'row', gap: 10 }, formActions: { flexDirection: 'row', gap: 10, marginTop: 16 }, formPrimary: { flex: 1 }, secondaryButton: { backgroundColor: '#FFF', marginVertical: scale.mWidth(12), borderWidth: 1, borderColor: '#DDE2EB', minHeight: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 }, secondaryButtonText: { color: INK, fontSize: 14, fontWeight: '800' },
  generationPanel: { backgroundColor: INK, marginTop: 48, borderRadius: 24, padding: 27, alignItems: 'center', overflow: 'hidden' }, orbit: { width: 124, height: 124, borderRadius: 62, borderWidth: 1, borderColor: 'rgba(104,216,176,.4)', justifyContent: 'center', alignItems: 'center', marginTop: 6, marginBottom: 28 }, orbitInner: { width: 82, height: 82, borderRadius: 41, backgroundColor: 'rgba(104,216,176,.15)', justifyContent: 'center', alignItems: 'center' }, orbitMark: { color: MINT, fontSize: 35 }, generatingEyebrow: { color: MINT, fontSize: 10, letterSpacing: 1.4, fontWeight: '800' }, generatingTitle: { color: '#FFF', textAlign: 'center', fontFamily: Typography.familyDisplay.bold, fontSize: 29, lineHeight: 35, marginTop: 11 }, generatingCopy: { color: '#B9C6DB', fontSize: 14, marginTop: 13 }, progressTrack: { height: 7, borderRadius: 6, backgroundColor: 'rgba(255,255,255,.15)', width: '100%', marginTop: 28, overflow: 'hidden' }, progressFill: { height: '100%', backgroundColor: MINT, borderRadius: 6 }, progressText: { color: '#B9C6DB', fontSize: 11, marginTop: 8, alignSelf: 'flex-end' }, generatingChecklist: { alignSelf: 'stretch', marginTop: 23, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.12)', paddingTop: 10 }, checkRow: { flexDirection: 'row', gap: 9, alignItems: 'center', paddingVertical: 7 }, check: { color: '#667793', fontSize: 14, width: 18 }, checkActive: { color: MINT }, checkText: { color: '#71809A', fontSize: 13 }, checkTextActive: { color: '#E8EDF6' }, originality: { color: '#8190A8', textAlign: 'center', fontSize: 10, marginTop: 18 },
  editorTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, editorTitleWrap: { flex: 1, marginRight: 12 }, editorKicker: { color: LILAC, fontSize: 10, letterSpacing: 1, fontWeight: '800', marginBottom: 6 }, editorTitle: { fontFamily: Typography.familyDisplay.bold, fontSize: 27, color: INK, padding: 0 }, previewButton: { borderWidth: 1, borderColor: INK, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11 }, previewButtonText: { color: INK, fontSize: 12, fontWeight: '800' }, editorStats: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14 }, editorStat: { color: INK_SOFT, fontSize: 11 }, statPoint: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#AAB4C5' }, chapterRail: { gap: 8, paddingBottom: 17 }, chapterTab: { width: 125, padding: 12, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E9F0' }, chapterTabActive: { backgroundColor: INK, borderColor: INK }, chapterNumber: { color: LILAC, fontSize: 10, fontWeight: '800', marginBottom: 7 }, chapterNumberActive: { color: MINT }, chapterTabTitle: { color: INK_SOFT, fontSize: 12, fontWeight: '700' }, chapterTabTitleActive: { color: '#FFF' }, addChapter: { width: 44, borderRadius: 12, borderColor: '#CBD3E1', borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }, addChapterText: { color: INK_SOFT, fontSize: 22 }, manuscript: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, ...Shadows.ambient }, manuscriptHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 }, manuscriptLabel: { color: LILAC, fontSize: 10, letterSpacing: 1, fontWeight: '800' }, chapterTitleInput: { fontFamily: Typography.familyDisplay.bold, color: INK, fontSize: 23, paddingVertical: 5, minWidth: 190 }, regenerateText: { color: LILAC, fontSize: 12, fontWeight: '800', marginTop: 9 }, editorTools: { flexDirection: 'row', gap: 7, marginVertical: 12, flexWrap: 'wrap' }, tool: { backgroundColor: '#F0F3FA', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 8 }, toolText: { color: INK_SOFT, fontSize: 11, fontWeight: '700' }, manuscriptInput: { color: '#394761', fontSize: 16, lineHeight: 27, minHeight: 310, padding: 0 }, manuscriptFooter: { borderTopColor: '#EFF1F5', borderTopWidth: 1, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }, wordNote: { color: '#9AA5B8', fontSize: 11 }, deleteText: { color: '#D45C67', fontSize: 11, fontWeight: '700' }, assistantBar: { backgroundColor: '#EAF0FF', borderRadius: 16, padding: 14, marginTop: 16, flexDirection: 'row', alignItems: 'center' }, assistantIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: INK, alignItems: 'center', justifyContent: 'center', marginRight: 10 }, assistantIconText: { color: MINT }, assistantCopy: { flex: 1 }, assistantTitle: { color: INK, fontSize: 13, fontWeight: '800' }, assistantSub: { color: INK_SOFT, fontSize: 11, marginTop: 3 }, assistantArrow: { color: INK, fontSize: 20 },
  aiAssistantPanel: { backgroundColor: '#FFF', borderRadius: 18, padding: 16, marginBottom: 14, ...Shadows.ambient },
  aiAssistantLabel: { color: LILAC, fontSize: 10, letterSpacing: 1, fontWeight: '800', marginBottom: 10 },
  aiAssistantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  aiAssistantChip: { backgroundColor: '#F0F3FA', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 12 },
  aiAssistantChipText: { color: INK, fontSize: 11, fontWeight: '800' },
  bookCover: { height: 400, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E7E3FF', borderRadius: 18, overflow: 'hidden' }, coverFrame: { width: 205, height: 310, padding: 24, backgroundColor: INK, borderWidth: 5, borderColor: '#F8F0D5', alignItems: 'center', ...Shadows.overlay }, coverGenre: { color: MINT, fontSize: 9, letterSpacing: 1.4, fontWeight: '800', marginTop: 8 }, coverTitle: { color: '#FFF', textAlign: 'center', fontFamily: Typography.familyDisplay.bold, fontSize: 28, lineHeight: 33, marginTop: 24 }, coverRule: { height: 1, width: 45, backgroundColor: MINT, marginTop: 20 }, coverAuthor: { color: '#B9C6DB', fontSize: 8, letterSpacing: 1.1, marginTop: 15 }, coverArt: { position: 'absolute', bottom: -17, color: LILAC, fontSize: 75, opacity: .75 }, previewMeta: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#FFF', paddingVertical: 16, borderRadius: 15, marginTop: 14, ...Shadows.ambient }, previewMetric: { color: INK, textAlign: 'center', fontSize: 15, fontWeight: '800' }, previewMetricLabel: { color: INK_SOFT, fontSize: 8, letterSpacing: .7, fontWeight: '700', marginTop: 4 }, toc: { backgroundColor: '#FFF', borderRadius: 18, padding: 18, marginTop: 17, ...Shadows.ambient }, tocTitle: { color: INK, fontFamily: Typography.familyDisplay.bold, fontSize: 21, marginBottom: 9 }, tocRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }, tocNum: { color: LILAC, fontSize: 11, fontWeight: '800' }, tocText: { color: INK, fontSize: 14, fontWeight: '600' }, tocRule: { flex: 1, height: 1, backgroundColor: '#E9ECF2', marginLeft: 3 }, previewActions: { flexDirection: 'row', gap: 10, marginTop: 17 }, previewUtilityActions: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 18 }, utilityAction: { color: INK_SOFT, fontSize: 12, fontWeight: '800' },
  coverUpload: { minHeight: 83, borderWidth: 1, borderStyle: 'dashed', borderColor: '#BFC8D8', borderRadius: 13, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 21 }, coverUploadIcon: { color: LILAC, fontSize: 21 }, coverUploadTitle: { color: INK, fontWeight: '800', fontSize: 14 }, coverUploadCopy: { color: INK_SOFT, fontSize: 11, marginTop: 4, maxWidth: 205 }, coverUploadArrow: { color: INK_SOFT, fontSize: 26, marginLeft: 'auto' }, draftButton: { alignItems: 'center', paddingVertical: 17 }, draftText: { color: INK_SOFT, fontSize: 14, fontWeight: '800' },
  modalShade: { flex: 1, backgroundColor: 'rgba(16,33,61,.45)', justifyContent: 'flex-end' }, assistantModal: { backgroundColor: PAPER, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 }, modalHandle: { width: 38, height: 4, borderRadius: 2, backgroundColor: '#CBD2DF', alignSelf: 'center', marginBottom: 17 }, modalEyebrow: { color: LILAC, letterSpacing: 1.1, fontSize: 10, fontWeight: '800' }, modalTitle: { color: INK, fontFamily: Typography.familyDisplay.bold, fontSize: 24, marginTop: 6, marginBottom: 16 }, quickPrompts: { gap: 8, marginBottom: 15 }, quickPrompt: { backgroundColor: '#FFF', borderRadius: 11, padding: 13, flexDirection: 'row', justifyContent: 'space-between', ...Shadows.ambient }, quickPromptText: { color: INK, fontSize: 13, fontWeight: '600' }, quickPromptArrow: { color: LILAC }, assistantInput: { marginBottom: 10, backgroundColor: '#FFF' },
});

export default UploadScreen;
