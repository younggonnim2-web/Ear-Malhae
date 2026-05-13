import { useMemo } from 'react'
import type { StudyItem, QuizAssignment } from '../../types'
import { isWordItem } from '../../types'
import { useSpeech } from '../../hooks/useSpeech'
import { buildChoices } from '../../utils/quizHelpers'
import { ImageChoiceQuiz } from './ImageChoiceQuiz'
import { MatchingQuiz } from './MatchingQuiz'
import { ListenChoiceQuiz } from './ListenChoiceQuiz'
import { SentenceBuilderQuiz } from './SentenceBuilderQuiz'
import { SENTENCES } from '../../data/sentences'

interface Props {
  item: StudyItem
  allItems: StudyItem[]
  assignment: QuizAssignment
  wordIndex: number
  onComplete: () => void
}

function getSameCategory(item: StudyItem, all: StudyItem[]): StudyItem[] {
  if (!isWordItem(item)) return all
  return all.filter(i => isWordItem(i) && i.category === item.category)
}

export function QuizStep({ item, allItems, assignment, onComplete }: Props) {
  const { speak } = useSpeech()
  const pool = getSameCategory(item, allItems)
  const fallbackPool = pool.length >= 4 ? pool : allItems

  const choices = useMemo(() => buildChoices(item, fallbackPool, 4), [item.id, fallbackPool.length])
  const matchItems = useMemo(() => buildChoices(item, fallbackPool, 3), [item.id, fallbackPool.length])

  function handleCorrect() {
    onComplete()
  }

  if (assignment.type === 'matching') {
    return <MatchingQuiz items={matchItems} onComplete={handleCorrect} />
  }

  if (assignment.type === 'listen-choice') {
    return (
      <ListenChoiceQuiz
        item={item}
        choices={choices}
        direction={assignment.direction}
        onCorrect={handleCorrect}
        speak={speak}
      />
    )
  }

  if (assignment.type === 'sentence-builder') {
    const sentence = SENTENCES[wordIndex % SENTENCES.length]
    return <SentenceBuilderQuiz sentence={sentence} onCorrect={handleCorrect} />
  }

  // image-choice is default
  return (
    <ImageChoiceQuiz
      item={item}
      choices={choices}
      direction={assignment.direction}
      onCorrect={handleCorrect}
    />
  )
}
