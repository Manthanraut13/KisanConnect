# Advanced Hybrid RAG Engine combining Document Chunking, BM25 Keyword Search,
# and TF-IDF Vector Semantic Search across website docs, DPR, & live pricing data.

import os
import re
import math
import logging
import pandas as pd
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class BM25:
    """Okapi BM25 ranking algorithm for fast keyword-based sparse retrieval."""
    def __init__(self, corpus, k1=1.5, b=0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = len(corpus)
        self.avgdl = sum(len(doc) for doc in corpus) / self.corpus_size if self.corpus_size > 0 else 1
        self.corpus = corpus
        self.doc_freqs = []
        self.idf = {}
        self.doc_len = [len(doc) for doc in corpus]
        self._initialize()

    def _initialize(self):
        df_counter = Counter()
        for doc in self.corpus:
            frequencies = Counter(doc)
            self.doc_freqs.append(frequencies)
            for word in frequencies:
                df_counter[word] += 1

        for word, freq in df_counter.items():
            # BM25 IDF with smoothing
            self.idf[word] = math.log((self.corpus_size - freq + 0.5) / (freq + 0.5) + 1.0)

    def get_scores(self, query_tokens):
        scores = [0.0] * self.corpus_size
        for token in query_tokens:
            if token not in self.idf:
                continue
            idf = self.idf[token]
            for index, doc_freqs in enumerate(self.doc_freqs):
                if token in doc_freqs:
                    freq = doc_freqs[token]
                    num = freq * (self.k1 + 1)
                    denom = freq + self.k1 * (1 - self.b + self.b * (self.doc_len[index] / self.avgdl))
                    scores[index] += idf * (num / denom)
        return scores


class HybridRAGEngine:
    """
    Hybrid RAG Engine indexing documentation and pricing data.
    Uses Reciprocal Rank Fusion (RRF) to merge BM25 Keyword Rank and TF-IDF Vector Rank.
    """

    def __init__(self, docs_dir=None, data_dir=None):
        self.docs_dir = docs_dir or os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs'))
        self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
        self.data_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'agmarknet_sample.csv'))
        
        self.chunks = []          # List of text chunk strings
        self.chunk_metadata = []   # List of dict metadata per chunk
        self.bm25 = None
        self.vectorizer = None
        self.tfidf_matrix = None
        
        self.build_index()

    def _clean_tokenize(self, text):
        """Tokenize text for BM25 search."""
        text = text.lower()
        tokens = re.findall(r'\w+', text)
        return [t for t in tokens if len(t) > 1]

    def _chunk_text(self, text, source_name, chunk_size=350, overlap=50):
        """Split document into overlapping paragraph/word chunks."""
        words = text.split()
        if not words:
            return []
        
        chunks = []
        start = 0
        while start < len(words):
            end = start + chunk_size
            chunk_str = " ".join(words[start:end])
            chunks.append((chunk_str, source_name))
            if end >= len(words):
                break
            start += (chunk_size - overlap)
        return chunks

    def build_index(self):
        """Load user-facing documentation files & pricing data, chunk them, and initialize BM25 + TFIDF matrices."""
        logger.info("Initializing Hybrid RAG Knowledge Base...")
        raw_chunks = []

        # 1. Load User-Facing Platform Knowledge Base (user_platform_kb.md)
        user_kb_file = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'user_platform_kb.md'))
        if os.path.exists(user_kb_file):
            try:
                with open(user_kb_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    raw_chunks.extend(self._chunk_text(content, "user_platform_kb.md", chunk_size=250, overlap=30))
            except Exception as e:
                logger.warning(f"Failed to read user_platform_kb.md: {e}")

        # 2. Load User-Facing Markdown Docs (filtering out developer-only internal git guides)
        if os.path.exists(self.docs_dir):
            for fname in os.listdir(self.docs_dir):
                if fname.endswith('.md') and 'GITHUB_GUIDE' not in fname:
                    fpath = os.path.join(self.docs_dir, fname)
                    try:
                        with open(fpath, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            raw_chunks.extend(self._chunk_text(content, f"docs/{fname}", chunk_size=300, overlap=40))
                    except Exception as e:
                        logger.warning(f"Failed to read {fname}: {e}")

        # 3. Load DPR.md (User-facing feature sections)
        dpr_file = os.path.join(self.root_dir, 'DPR.md')
        if os.path.exists(dpr_file):
            try:
                with open(dpr_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    raw_chunks.extend(self._chunk_text(content, "DPR.md", chunk_size=350, overlap=50))
            except Exception as e:
                logger.warning(f"Failed to read DPR.md: {e}")

        # 4. Load & Summary Index Agmarknet Crop Prices Dataset
        if os.path.exists(self.data_file):
            try:
                df = pd.read_csv(self.data_file)
                if not df.empty and 'commodity' in df.columns and 'district' in df.columns:
                    summary = df.groupby(['commodity', 'district'])['modal_price'].agg(['min', 'max', 'mean']).reset_index()
                    pricing_texts = []
                    for _, row in summary.iterrows():
                        mean_kg = row['mean'] / 100.0 if row['mean'] > 150 else row['mean']
                        min_kg = row['min'] / 100.0 if row['min'] > 150 else row['min']
                        max_kg = row['max'] / 100.0 if row['max'] > 150 else row['max']
                        p_str = (
                            f"Kisan Connect Mandi Pricing Data: Crop {row['commodity']} in district {row['district']} "
                            f"has average benchmark modal price Rs.{mean_kg:.2f}/kg (Rs.{row['mean']:.2f}/Quintal), "
                            f"min price Rs.{min_kg:.2f}/kg (Rs.{row['min']:.2f}/Quintal), "
                            f"max price Rs.{max_kg:.2f}/kg (Rs.{row['max']:.2f}/Quintal). Real-time Mandi price benchmark data."
                        )
                        pricing_texts.append((p_str, "agmarknet_prices"))
                    raw_chunks.extend(pricing_texts)
            except Exception as e:
                logger.warning(f"Failed to index pricing CSV for RAG: {e}")

        # Fallback default knowledge if no files found
        if not raw_chunks:
            raw_chunks.append((
                "Kisan Connect is an AI-powered direct farm-to-consumer marketplace for India. "
                "Farmers earn direct revenue by listing crops. Consumers buy fresh produce at fair prices. "
                "Features include AI Demand Forecast, Dynamic Price Recommendation, Route Optimization, and Kisan Mitra Chatbot.",
                "system_default"
            ))

        self.chunks = [c[0] for c in raw_chunks]
        self.chunk_metadata = [{"source": c[1]} for c in raw_chunks]

        # Build BM25 Index
        tokenized_corpus = [self._clean_tokenize(c) for c in self.chunks]
        self.bm25 = BM25(tokenized_corpus)

        # Build TF-IDF Vectorizer Matrix
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.tfidf_matrix = self.vectorizer.fit_transform(self.chunks)

        logger.info(f"Hybrid RAG Index built successfully with {len(self.chunks)} knowledge chunks.")

    def search(self, query, top_k=4):
        """
        Hybrid search using Reciprocal Rank Fusion (RRF).
        RRF Score = 1 / (60 + BM25_Rank) + 1 / (60 + Vector_Rank) + User KB Source Boost
        """
        if not self.chunks or not query:
            return []

        # 1. Sparse BM25 Keyword Search
        query_tokens = self._clean_tokenize(query)
        bm25_scores = self.bm25.get_scores(query_tokens)
        bm25_ranked_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)
        bm25_ranks = {idx: rank + 1 for rank, idx in enumerate(bm25_ranked_indices)}

        # 2. Dense TF-IDF Cosine Vector Search
        try:
            query_vec = self.vectorizer.transform([query])
            cosine_scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
            vector_ranked_indices = sorted(range(len(cosine_scores)), key=lambda i: cosine_scores[i], reverse=True)
            vector_ranks = {idx: rank + 1 for rank, idx in enumerate(vector_ranked_indices)}
        except Exception:
            vector_ranks = {i: i + 1 for i in range(len(self.chunks))}

        # 3. Reciprocal Rank Fusion (RRF) with User KB Source Boosting
        rrf_scores = {}
        k_const = 60
        q_lower = query.lower()

        for idx in range(len(self.chunks)):
            r_bm25 = bm25_ranks.get(idx, 9999)
            r_vec = vector_ranks.get(idx, 9999)
            score = (1.0 / (k_const + r_bm25)) + (1.0 / (k_const + r_vec))

            source = self.chunk_metadata[idx]["source"]
            chunk_lower = self.chunks[idx].lower()

            # Primary boost for user-facing knowledge base over developer specs
            if 'user_platform_kb.md' in source:
                score += 0.5

            # Extra boost for active produce listings queries
            if any(k in q_lower for k in ['listing', 'listings', 'produce', 'available', 'buy', 'items', 'crops', 'product']):
                if 'active farm produce' in chunk_lower or 'organic tomatoes' in chunk_lower or 'user_platform_kb.md' in source:
                    score += 0.5

            # Extra boost for crop pricing queries
            if any(k in q_lower for k in ['price', 'pricing', 'rate', 'cost', 'bhav', 'dam', 'mandi', 'potato', 'onion', 'tomato', 'wheat', 'rice']):
                if 'agmarknet_prices' in source or 'mandi pricing' in chunk_lower:
                    score += 0.5

            rrf_scores[idx] = score

        # Top-k fused indices
        fused_indices = sorted(rrf_scores.keys(), key=lambda i: rrf_scores[i], reverse=True)[:top_k]
        
        results = []
        for idx in fused_indices:
            results.append({
                "chunk": self.chunks[idx],
                "source": self.chunk_metadata[idx]["source"],
                "rrf_score": rrf_scores[idx]
            })
        return results

    def get_context_str(self, query, top_k=4):
        """Return combined string context for LLM prompt."""
        matches = self.search(query, top_k=top_k)
        if not matches:
            return ""
        context_blocks = [f"--- Source: {m['source']} ---\n{m['chunk']}" for m in matches]
        return "\n\n".join(context_blocks)
