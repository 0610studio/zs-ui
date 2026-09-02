const fs = require('fs');
const path = require('path');

const TEST_RESULTS_JSON = path.join(__dirname, '../test-results.json');
const COVERAGE_SUMMARY_JSON = path.join(__dirname, '../coverage/coverage-summary.json');
const README_PATH = path.join(__dirname, '../README.md');
const TEST_RESULTS_MARKER = '<!-- TEST_RESULTS -->';

function formatCoverage(coverage) {
  if (!coverage || !coverage.total) {
    return null;
  }

  const { branches, functions, lines, statements } = coverage.total;
  
  const formatPercent = (pct) => {
    if (pct === undefined || pct === null) return 'N/A';
    return `${pct.toFixed(1)}%`;
  };

  const getStatusEmoji = (pct) => {
    if (pct === undefined || pct === null) return '';
    if (pct >= 90) return '🟢';
    if (pct >= 70) return '🟡';
    return '🔴';
  };

  return {
    statements: {
      pct: statements?.pct,
      covered: statements?.covered,
      total: statements?.total,
      emoji: getStatusEmoji(statements?.pct),
      formatted: formatPercent(statements?.pct)
    },
    branches: {
      pct: branches?.pct,
      covered: branches?.covered,
      total: branches?.total,
      emoji: getStatusEmoji(branches?.pct),
      formatted: formatPercent(branches?.pct)
    },
    functions: {
      pct: functions?.pct,
      covered: functions?.covered,
      total: functions?.total,
      emoji: getStatusEmoji(functions?.pct),
      formatted: formatPercent(functions?.pct)
    },
    lines: {
      pct: lines?.pct,
      covered: lines?.covered,
      total: lines?.total,
      emoji: getStatusEmoji(lines?.pct),
      formatted: formatPercent(lines?.pct)
    }
  };
}

function getCoverageData() {
  if (!fs.existsSync(COVERAGE_SUMMARY_JSON)) {
    return null;
  }

  try {
    const coverageSummary = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY_JSON, 'utf8'));
    return coverageSummary.total;
  } catch (error) {
    console.warn('커버리지 정보를 읽는 중 오류가 발생했습니다:', error.message);
    return null;
  }
}

function formatTestResults(jsonResults) {
  const { numPassedTests, numFailedTests, numTotalTests, testResults, startTime } = jsonResults;
  const successRate = ((numPassedTests / numTotalTests) * 100).toFixed(1);
  const status = numFailedTests === 0 ? '✅ 성공' : '❌ 실패';
  const timestamp = new Date(startTime).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const coverageTotal = getCoverageData();
  const coverage = coverageTotal ? formatCoverage({ total: coverageTotal }) : null;

  let markdown = `\n${TEST_RESULTS_MARKER}\n## 테스트 결과\n\n`;
  
  markdown += `| 항목 | 값 |\n`;
  markdown += `|------|-----|\n`;
  markdown += `| **상태** | ${status} |\n`;
  markdown += `| **실행 시간** | ${timestamp} |\n`;
  markdown += `| **전체 테스트** | ${numTotalTests} |\n`;
  markdown += `| **성공** | ✅ ${numPassedTests} |\n`;
  markdown += `| **실패** | ${numFailedTests > 0 ? '❌' : '✅'} ${numFailedTests} |\n`;
  markdown += `| **성공률** | ${successRate}% |\n\n`;
  
  if (coverage) {
    markdown += `### 📊 코드 커버리지\n\n`;
    markdown += `| 항목 | 커버리지 | 상태 |\n`;
    markdown += `|------|---------|------|\n`;
    markdown += `| **Statements** | ${coverage.statements.formatted} | ${coverage.statements.emoji} |\n`;
    markdown += `| **Branches** | ${coverage.branches.formatted} | ${coverage.branches.emoji} |\n`;
    markdown += `| **Functions** | ${coverage.functions.formatted} | ${coverage.functions.emoji} |\n`;
    markdown += `| **Lines** | ${coverage.lines.formatted} | ${coverage.lines.emoji} |\n\n`;
  }
  
  if (numFailedTests > 0) {
    const failedTests = [];
    testResults.forEach(result => {
      if (result.status === 'failed') {
        result.assertionResults?.forEach(assertion => {
          if (assertion.status === 'failed') {
            failedTests.push({
              suite: result.name,
              test: assertion.title,
              failureMessages: assertion.failureMessages || []
            });
          }
        });
      }
    });

    if (failedTests.length > 0) {
      markdown += `### ❌ 실패한 테스트\n\n`;
      markdown += `| 테스트 스위트 | 테스트 케이스 |\n`;
      markdown += `|--------------|--------------|\n`;
      failedTests.forEach(test => {
        const suiteName = test.suite.split('/').pop() || test.suite;
        markdown += `| \`${suiteName}\` | ${test.test} |\n`;
      });
      markdown += `\n`;
    }
  } else {
    markdown += `### ✅ 모든 테스트 통과\n\n`;
  }

  markdown += `${TEST_RESULTS_MARKER}\n`;

  return markdown;
}

function updateReadme(testResultsMarkdown) {
  if (!fs.existsSync(README_PATH)) {
    console.error('README.md 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  let readmeContent = fs.readFileSync(README_PATH, 'utf8');
  
  const markerRegex = new RegExp(`${TEST_RESULTS_MARKER}[\\s\\S]*?${TEST_RESULTS_MARKER}`, 'g');
  readmeContent = readmeContent.replace(markerRegex, '');

  readmeContent = readmeContent.trimEnd() + testResultsMarkdown;

  fs.writeFileSync(README_PATH, readmeContent, 'utf8');
  console.log('✅ README.md에 테스트 결과가 업데이트되었습니다.');
}

if (!fs.existsSync(TEST_RESULTS_JSON)) {
  console.error('test-results.json 파일을 찾을 수 없습니다. 테스트가 실행되지 않았거나 실패했을 수 있습니다.');
  process.exit(1);
}

try {
  const jsonResults = JSON.parse(fs.readFileSync(TEST_RESULTS_JSON, 'utf8'));
  const testResultsMarkdown = formatTestResults(jsonResults);
  updateReadme(testResultsMarkdown);
} catch (error) {
  console.error('테스트 결과를 처리하는 중 오류가 발생했습니다:', error.message);
  process.exit(1);
}

