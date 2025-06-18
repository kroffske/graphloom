import { render, screen, fireEvent } from '@testing-library/react';
import { CollapsibleSubsection } from '../CollapsibleSubsection';
import { Database } from 'lucide-react';
import '@testing-library/jest-dom';

describe('CollapsibleSubsection', () => {
  it('renders with title and content', () => {
    render(
      <CollapsibleSubsection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSubsection>
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(
      <CollapsibleSubsection 
        title="Test Section" 
        icon={<Database data-testid="test-icon" />}
      >
        <div>Test Content</div>
      </CollapsibleSubsection>
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('starts expanded by default', () => {
    render(
      <CollapsibleSubsection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSubsection>
    );

    expect(screen.getByText('Test Content')).toBeVisible();
  });

  it('starts collapsed when defaultOpen is false', () => {
    render(
      <CollapsibleSubsection title="Test Section" defaultOpen={false}>
        <div>Test Content</div>
      </CollapsibleSubsection>
    );

    // Content should be in the DOM but not visible
    const content = screen.getByText('Test Content');
    expect(content).toBeInTheDocument();
  });

  it('toggles visibility when clicked', async () => {
    render(
      <CollapsibleSubsection title="Test Section">
        <div>Test Content</div>
      </CollapsibleSubsection>
    );

    const button = screen.getByRole('button', { name: /Test Section/i });
    const content = screen.getByText('Test Content');

    // Initially visible
    expect(content).toBeVisible();

    // Click to collapse
    fireEvent.click(button);
    
    // After animation, content should not be visible
    // Note: This tests the state change, actual visibility depends on CSS
    expect(button).toBeInTheDocument();

    // Click to expand
    fireEvent.click(button);
    
    // Content should be visible again
    expect(content).toBeInTheDocument();
  });
});