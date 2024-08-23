import React from 'react'
import { Card } from './ui/card'
import { Progress } from './ui/progress';

interface BudgetCardProps {
    budget: {
      name: string;
      limit: number;
      item?: number;
      spent: number;
    };
  }
 


const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const progressValue = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

    return (
    <Card className="w-[250px] h-[180px] m-5 px-5 py-2 flex flex-col justify-between">
      <div className='flex justify-between'>
        <div className='flex flex-col'>
        <span className='text-lg font-bold'>{budget.name}</span>
        <span className='text-slate-400'>0 item</span>
        </div>
        <span className='text-lg font-bold'>${budget.limit}</span>
      </div>
      
      <div className="flex justify-between">
        <span className='text-sm text-slate-400'>${budget.spent} Spent</span>
        <span className='text-sm text-slate-400'>${budget.limit-budget.spent} remaining</span>
      </div>
      <div>
      <Progress value={progressValue} />
      </div>
    </Card>
  )
}

export default BudgetCard
