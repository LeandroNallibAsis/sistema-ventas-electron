import React, { useState } from 'react';
import QuotesList from './QuotesList';
import QuoteForm from './QuoteForm';

const QuotesManager = () => {
    const [view, setView] = useState('list'); // 'list' or 'create'

    if (view === 'create') {
        return (
            <QuoteForm
                onCancel={() => setView('list')}
                onQuoteCreated={() => setView('list')}
            />
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* We can inject the Create button into the List via a prop or just render it above? 
                Actually QuotesList has a header. Let's make QuotesList accept a custom header action or just modify QuotesList.
                Better yet: Let QuotesList handle the display, but we pass a "onCreate" prop.
            */}
            <QuotesList onCreate={() => setView('create')} />
        </div>
    );
};

export default QuotesManager;
