import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Activity } from 'lucide-react';

const TestCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Test Card</CardTitle>
    </CardHeader>
    <CardContent>
      <p>This is a test card component.</p>
      <Activity className="h-6 w-6 text-blue-500" />
    </CardContent>
  </Card>
);

export default TestCard;
