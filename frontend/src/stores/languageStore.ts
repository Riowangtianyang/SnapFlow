// Language Store - i18n state management with zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'zh' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    // Navigation
    'nav.workflows': '工作流',
    'nav.history': '执行历史',
    'nav.settings': '设置',
    // Settings
    'settings.title': '设置',
    'settings.language': '语言设置',
    'settings.languageDesc': '选择界面显示语言',
    'settings.theme': '主题设置',
    'settings.themeDesc': '选择界面主题',
    'settings.about': '关于',
    'settings.version': '版本',
    // Workflow
    'workflow.list': '工作流列表',
    'workflow.create': '新建工作流',
    'workflow.name': '名称',
    'workflow.description': '描述',
    'workflow.steps': '步骤',
    'workflow.created': '创建时间',
    'workflow.updated': '更新时间',
    // Common
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.confirm': '确认',
    'common.back': '返回',
    // Canvas
    'canvas.nodes': '节点',
    'canvas.properties': '属性',
    // Intent
    'intent.title': '意图编辑',
    'intent.total': '总意图',
    'intent.step': '单步意图',
    'intent.confirm': '确认意图',
    'intent.reject': '拒绝',
    // Results
    'results.title': '结果',
    'results.export': '导出',
    'results.noData': '暂无数据',
  },
  en: {
    // Navigation
    'nav.workflows': 'Workflows',
    'nav.history': 'Execution History',
    'nav.settings': 'Settings',
    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose interface display language',
    'settings.theme': 'Theme',
    'settings.themeDesc': 'Choose interface theme',
    'settings.about': 'About',
    'settings.version': 'Version',
    // Workflow
    'workflow.list': 'Workflow List',
    'workflow.create': 'New Workflow',
    'workflow.name': 'Name',
    'workflow.description': 'Description',
    'workflow.steps': 'Steps',
    'workflow.created': 'Created',
    'workflow.updated': 'Updated',
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    // Canvas
    'canvas.nodes': 'Nodes',
    'canvas.properties': 'Properties',
    // Intent
    'intent.title': 'Intent Editor',
    'intent.total': 'Total Intent',
    'intent.step': 'Step Intent',
    'intent.confirm': 'Confirm Intent',
    'intent.reject': 'Reject',
    // Results
    'results.title': 'Results',
    'results.export': 'Export',
    'results.noData': 'No data',
  },
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'zh',
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const { language } = get()
        return translations[language][key] || key
      },
    }),
    {
      name: 'snapflow-language',
    }
  )
)
