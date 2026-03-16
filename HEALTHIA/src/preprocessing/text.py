from __future__ import annotations

import re
import unicodedata
from difflib import get_close_matches

from sklearn.base import BaseEstimator, TransformerMixin


PORTUGUESE_STOPWORDS = {
    "a", "ao", "aos", "as", "com", "da", "das", "de", "do", "dos", "e", "em",
    "na", "nas", "no", "nos", "o", "os", "para", "por", "sem", "um", "uma",
    "uns", "umas", "meu", "minha", "tenho", "estou", "sinto", "muito", "muita",
    "pouco", "pouca", "ha", "faz", "ser", "estar", "ficar", "tipo", "mas",
}

ABBREVIATIONS = {
    "cefaleia": "dor_cabeca",
    "dispneia": "falta_ar",
    "disuria": "ardor_urinar",
    "dm": "diabetes",
    "has": "hipertensao",
    "ivu": "infeccao_urinaria",
    "taquicardia": "palpitacao",
    "odinofagia": "dor_garganta",
    "tossecatarral": "tosse_produtiva",
}

TOKEN_NORMALIZATION = {
    "enjoo": "nausea",
    "enjoos": "nausea",
    "vomitos": "vomito",
    "vomitando": "vomito",
    "vomitar": "vomito",
    "febril": "febre",
    "febres": "febre",
    "dorcabeca": "dor_cabeca",
    "cabeca": "cabeca",
    "garganta": "garganta",
    "ardencia": "ardor",
    "ardendo": "ardor",
    "peito": "peito",
    "respirar": "respirar",
    "cansaco": "fadiga",
    "cansada": "fadiga",
    "cansado": "fadiga",
    "fraqueza": "fraqueza",
    "urinando": "urinar",
    "urino": "urinar",
    "urina": "urinar",
    "xixi": "urinar",
    "ixi": "urinar",
    "evacuar": "evacuar",
    "evacuacao": "evacuar",
    "nariz": "nariz",
    "coceira": "prurido",
    "coçando": "prurido",
    "machas": "manchas",
    "mancha": "manchas",
    "vermelhidao": "vermelhidao",
    "apertado": "aperto",
    "apertando": "aperto",
    "falta": "falta",
    "ar": "ar",
}

PHRASE_NORMALIZATION = {
    "dor de cabeca": "dor_cabeca",
    "falta de ar": "falta_ar",
    "dor no peito": "dor_peito",
    "aperto no peito": "dor_peito",
    "coracao acelerado": "palpitacao",
    "batimento acelerado": "palpitacao",
    "ardor ao urinar": "ardor_urinar",
    "dor para urinar": "ardor_urinar",
    "urinar toda hora": "urinar_frequente",
    "vontade de urinar toda hora": "urinar_frequente",
    "vontade de fazer xixi toda hora": "urinar_frequente",
    "fazendo xixi toda hora": "urinar_frequente",
    "nariz entupido": "congestao_nasal",
    "nariz escorrendo": "coriza",
    "dor de garganta": "dor_garganta",
    "perda de olfato": "anosmia",
    "perda do olfato": "anosmia",
    "perda de paladar": "ageusia",
    "falta de energia": "fadiga",
    "dor nas articulacoes": "dor_articular",
    "dor nas juntas": "dor_articular",
    "vista embaçada": "visao_turva",
    "visao embaçada": "visao_turva",
    "boca seca": "boca_seca",
    "olhos secos": "olhos_secos",
    "suor frio": "sudorese",
}

MEANINGLESS_TOKENS = {"abc", "xyz", "teste", "asdf", "qwer"}

NEGATION_CUES = {"nao", "nem", "sem"}


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(character for character in normalized if not unicodedata.combining(character))


def light_portuguese_stem(token: str) -> str:
    for suffix in (
        "mente", "ções", "coes", "sões", "sao", "zinha", "zinho", "inhas", "inhos",
        "icos", "icas", "ico", "ica", "ados", "adas", "ado", "ada", "idos", "idas",
        "ido", "ida", "ismos", "ismo", "istas", "ista", "eza", "ezas", "uras", "ura",
        "ções", "ção", "mente", "s",
    ):
        if token.endswith(suffix) and len(token) > len(suffix) + 2:
            return token[: -len(suffix)]
    return token


def basic_tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z_]{2,}", text)


class SymptomTextPreprocessor(BaseEstimator, TransformerMixin):
    def __init__(self, vocabulary_reference: tuple[str, ...] = ()) -> None:
        self.vocabulary_reference = vocabulary_reference
        self.reference_terms_: list[str] = []

    def fit(self, X, y=None):
        terms = set()
        for text in X:
            normalized = self.normalize_text(str(text))
            terms.update(basic_tokenize(normalized))
        terms.update(self.vocabulary_reference)
        self.reference_terms_ = sorted(terms)
        return self

    def transform(self, X):
        return [self.normalize_text(str(text)) for text in X]

    def normalize_text(self, text: str) -> str:
        text = strip_accents(text.lower())
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        for phrase, replacement in PHRASE_NORMALIZATION.items():
            text = text.replace(phrase, replacement)
        tokens = basic_tokenize(text)

        normalized_tokens = []
        skip_next = 0
        for index, token in enumerate(tokens):
            if skip_next:
                skip_next -= 1
                continue
            if token in NEGATION_CUES:
                negated_index = self._find_negated_token(tokens, index + 1)
                if negated_index is not None:
                    normalized_tokens.append(f"neg_{self._normalize_token(tokens[negated_index])}")
                    skip_next = negated_index - index
                continue
            normalized = self._normalize_token(token)
            if not normalized or normalized in PORTUGUESE_STOPWORDS or normalized in MEANINGLESS_TOKENS:
                continue
            normalized_tokens.append(normalized)

        return " ".join(normalized_tokens)

    def _normalize_token(self, token: str) -> str:
        token = ABBREVIATIONS.get(token, token)
        token = TOKEN_NORMALIZATION.get(token, token)
        token = token.replace(" ", "_")
        token = light_portuguese_stem(token)

        if token in TOKEN_NORMALIZATION:
            token = TOKEN_NORMALIZATION[token]

        if self.reference_terms_ and token not in self.reference_terms_:
            matches = get_close_matches(token, self.reference_terms_, n=1, cutoff=0.9)
            if matches:
                token = matches[0]
        return token

    def _find_negated_token(self, tokens: list[str], start_index: int) -> int | None:
        for index in range(start_index, len(tokens)):
            candidate = self._normalize_token(tokens[index])
            if candidate and candidate not in PORTUGUESE_STOPWORDS:
                return index
        return None


def is_meaningful_input(text: str) -> bool:
    normalized = SymptomTextPreprocessor().normalize_text(text)
    tokens = [token for token in normalized.split() if not token.startswith("neg_")]
    return len(tokens) >= 2
