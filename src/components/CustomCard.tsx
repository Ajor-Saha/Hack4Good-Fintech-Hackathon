import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'


interface CustomCardProps {
  title: string;
  amount: number;
  description: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ title, amount, description }) => {
  return (
    <Card className="w-[250px] flex flex-col justify-between h-[180px] mx-auto mb-5">
      <CardHeader>
      <CardDescription>{description}.</CardDescription>
        <CardTitle>{`$${amount || 0 }`}</CardTitle>
      </CardHeader>
      <CardContent className='flex justify-between'>
        <span>{title}</span>
        <span>Last 30 days</span>
      </CardContent>
      
    </Card>
  )
}

export default CustomCard

/*
Saving money for this moth

Total Expense 

Latest Total Budget
 */
