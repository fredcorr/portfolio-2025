import React from 'react'

import withPageTransition from '@/components/hoc/withPageTransition'

interface CmsTemplateProps {
  children: React.ReactNode
}

const CmsTemplate = ({ children }: CmsTemplateProps) => {
  return children
}

export default withPageTransition(CmsTemplate)
