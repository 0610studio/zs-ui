import { StyleSheet, View } from 'react-native';
import { ZSBox, ZSPressable, ZSText, radiusStyle, useTheme, withOpacity } from '@0610studio/zs-ui';
import { GAP, TABULAR } from '../../kit/layout';
import BarChart from './BarChart';
import {
  COMPARE_WEEKS,
  OVERVIEW_TEXT,
  behaviorSummary,
  todoCountText,
  todoRows,
  type OverviewBehavior,
  type OverviewPeriod,
  type OverviewTodo,
} from '../../../model/diary/overview';

const TRACK = 10;
const CELL = 22;

function Progress({ rate, goal }: { rate: number; goal: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: colors.surface4 }]}>
      {rate > 0 ? <View style={[styles.fill, { width: `${Math.round(rate * 100)}%`, backgroundColor: goal ? colors.primaryMark : colors.textSecondary }]} /> : null}
    </View>
  );
}

function Cells({ cells, goal, first, last }: { cells: NonNullable<OverviewTodo['periods']>; goal: boolean; first: string; last: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.cellsBox}>
      <View style={styles.cells}>
        {cells.map((cell, index) => {
          const color = goal ? colors.primaryMark : colors.textSecondary;
          const fill = cell.rate <= 0 ? colors.surface4 : goal && !cell.achieved ? withOpacity(color, Math.max(0.25, cell.rate)) : color;
          return <View key={index} style={[styles.cell, { backgroundColor: fill }]} />;
        })}
      </View>
      <View style={styles.cellLabels}>
        <ZSText variant="caption" color="textSecondary">
          {first}
        </ZSText>
        <ZSText variant="caption" color="textSecondary">
          {last}
        </ZSText>
      </View>
    </View>
  );
}

export function TodoProgress({ todos, period, labels }: { todos: OverviewTodo[]; period: OverviewPeriod; labels: string[] }) {
  const rows = todoRows(todos);
  return (
    <View style={styles.todos}>
      {rows.map((todo) => {
        const { count, meta } = todoCountText(todo, period);
        const goal = todo.target > 0;
        const members = todo.members.filter((member) => member.count > 0);
        return (
          <View key={todo.id} style={styles.todo} accessible accessibilityLabel={`${todo.name}, ${count}, ${meta}${todo.assignee ? `, ${OVERVIEW_TEXT.todo.assignee} ${todo.assignee}` : ''}`} testID={`overview-todo-${todo.id}`}>
            <View style={styles.todoTitle}>
              <ZSText variant="subtitle2" numberOfLines={1} style={styles.todoName}>
                {todo.name}
              </ZSText>
              <ZSText variant="body2" color="textSecondary" style={TABULAR}>
                {count}
              </ZSText>
              <ZSText variant="caption" color="textSecondary" style={TABULAR}>
                {`(${meta})`}
              </ZSText>
            </View>
            {period !== 'day' && todo.periods && todo.periods.length > 0 ? (
              <Cells cells={todo.periods} goal={goal} first={labels[0]} last={labels[labels.length - 1]} />
            ) : (
              <Progress rate={todo.rate} goal={goal} />
            )}
            {todo.assignee || members.length > 0 ? (
              <View style={styles.members}>
                {todo.assignee ? (
                  <ZSBox backgroundColor="primaryContainer" style={[styles.chip, radiusStyle('full')]}>
                    <ZSText variant="caption" emphasized color="onPrimaryContainer">
                      {`${OVERVIEW_TEXT.todo.assignee} ${todo.assignee}`}
                    </ZSText>
                  </ZSBox>
                ) : null}
                {members.length > 0 ? (
                  <ZSText variant="caption" color="textSecondary">
                    {members.map((member) => `${member.name} ${member.count}회`).join(' · ')}
                  </ZSText>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function BehaviorProgress({ behaviors, now, onPress }: { behaviors: OverviewBehavior[]; now: Date; onPress: () => void }) {
  const { colors } = useTheme();
  const main = behaviors[0];
  if (!main) return null;
  const summary = behaviorSummary(main);
  const others = behaviors.slice(1, 3).map((behavior) => behaviorSummary(behavior).headline);
  const hidden = behaviors.length - 1 - others.length;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const bars = main.weeks.map((value, index) => {
    const back = main.weeks.length - 1 - index;
    const start = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - back * 7);
    const recent = back >= 1 && back <= COMPARE_WEEKS;
    return {
      label: back === 0 ? OVERVIEW_TEXT.behavior.thisWeek : `${start.getMonth() + 1}/${start.getDate()}`,
      value,
      tone: back === 0 ? ('outline' as const) : recent ? ('strong' as const) : ('soft' as const),
      dot: main.trainedWeeks.includes(index),
    };
  });
  const lines = [summary.headline, summary.basis, summary.minutes, ...others, hidden > 0 ? OVERVIEW_TEXT.behavior.othersMore(hidden) : null].filter(Boolean);

  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${lines.join(', ')}, ${OVERVIEW_TEXT.behavior.cardA11y}`} testID="overview-behavior-card" style={styles.behavior}>
      <View style={styles.behaviorText}>
        <ZSText variant="subtitle1" emphasized>
          {summary.headline}
        </ZSText>
        <ZSText variant="body2" color="textSecondary">
          {summary.basis}
        </ZSText>
        {summary.minutes ? (
          <ZSText variant="body2" color="textSecondary">
            {summary.minutes}
          </ZSText>
        ) : null}
      </View>
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <BarChart bars={bars} color={colors.info} format={(value) => `${value}회`} showValues maxLabels={4} height={136} testID="overview-behavior-chart" />
        <View style={styles.weekLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: colors.info }]} />
            <ZSText variant="caption" color="textSecondary">
              {OVERVIEW_TEXT.behavior.recentLegend(COMPARE_WEEKS)}
            </ZSText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.legendDashed, { backgroundColor: withOpacity(colors.info, 0.12), borderColor: colors.info }]} />
            <ZSText variant="caption" color="textSecondary">
              {OVERVIEW_TEXT.behavior.thisWeekLegend}
            </ZSText>
          </View>
          {main.trainedWeeks.length > 0 ? (
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primaryMark }]} />
              <ZSText variant="caption" color="textSecondary">
                {OVERVIEW_TEXT.behavior.trainingLegend}
              </ZSText>
            </View>
          ) : null}
        </View>
      </View>
      {others.length > 0 ? (
        <View style={[styles.others, { borderTopColor: colors.border }]}>
          {others.map((line) => (
            <ZSText key={line} variant="body2" color="textSecondary">
              {`· ${line}`}
            </ZSText>
          ))}
          {hidden > 0 ? (
            <ZSText variant="caption" color="textSecondary">
              {OVERVIEW_TEXT.behavior.othersMore(hidden)}
            </ZSText>
          ) : null}
        </View>
      ) : null}
    </ZSPressable>
  );
}

export function WeightGoal({ goal, onPress }: { goal: { text: string; progress: number; speed: string | null }; onPress: () => void }) {
  return (
    <ZSPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={[goal.text, goal.speed].filter(Boolean).join('. ')} testID="overview-weight-goal" style={styles.goal}>
      <ZSText variant="subtitle2" emphasized>
        {goal.text}
      </ZSText>
      <Progress rate={goal.progress} goal />
      {goal.speed ? (
        <ZSText variant="caption" color="textSecondary">
          {goal.speed}
        </ZSText>
      ) : null}
    </ZSPressable>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', height: TRACK, borderRadius: TRACK / 2, overflow: 'hidden' },
  fill: { height: TRACK, borderRadius: TRACK / 2, minWidth: TRACK / 2 },
  cellsBox: { gap: GAP.xs },
  cells: { flexDirection: 'row', gap: GAP.xs },
  cell: { flex: 1, height: CELL, borderRadius: 6 },
  cellLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  todos: { gap: GAP.xl },
  todo: { gap: GAP.sm },
  todoTitle: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs },
  todoName: { flex: 1 },
  members: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: GAP.sm },
  chip: { paddingHorizontal: GAP.sm, paddingVertical: GAP.xxs },
  behavior: { gap: GAP.md, borderRadius: 12 },
  behaviorText: { gap: GAP.xxs },
  weekLegend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', columnGap: GAP.md, rowGap: GAP.xxs, marginTop: GAP.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs },
  legendBox: { width: 10, height: 10, borderRadius: 2 },
  legendDashed: { borderWidth: 1, borderStyle: 'dashed' },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  others: { gap: GAP.xxs, paddingTop: GAP.sm, borderTopWidth: 1 },
  goal: { gap: GAP.sm, marginTop: GAP.xs },
});
