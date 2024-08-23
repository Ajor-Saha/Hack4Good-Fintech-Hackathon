import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'

const CustomCard = () => {
  return (
    <Card className="w-[250px] mx-auto mb-5">
      <CardHeader>
      <CardDescription>Deploy your new project in one-click.</CardDescription>
        <CardTitle>$122000</CardTitle>
      </CardHeader>
      <CardContent className='flex justify-between'>
        <span>22%</span>
        <span>Last 7 days</span>
      </CardContent>
      
    </Card>
  )
}

export default CustomCard
